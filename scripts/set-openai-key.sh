#!/bin/bash
# Run:  bash scripts/set-openai-key.sh   then create the key on platform.openai.com/api-keys and press its copy button.
# The script waits for the key on the clipboard, saves it privately on this Mac, sets it on Netlify, clears the clipboard and tests it
# with one tiny low-quality image (a cent or less). The key is never printed.
set -u
SITE=c8fb4186-2552-46b4-9afd-770d08ad7cc2 # the slashkern site on Netlify
MODEL=gpt-image-2.5-flare
DIR="$HOME/.config/kern"; F="$DIR/openai-key"
mkdir -p "$DIR" && umask 077

# An OpenAI key starts with sk- (sk-proj-... too). Anthropic's sk-ant- and ElevenLabs' sk_ never count. A key already copied is taken at once, else it waits up to 5 minutes.
fresh() { c=$(pbpaste | tr -d '[:space:]'); case "$c" in sk-ant-*) return 1 ;; sk-*) printf '%s' "$c" > "$F"; return 0 ;; *) return 1 ;; esac; }
if ! fresh; then
  echo "Waiting for the new key. On platform.openai.com/api-keys: Create new secret key, then press its copy button."
  for _ in $(seq 1 300); do sleep 1; fresh && break; done
  if [ ! -s "$F" ]; then echo "No new key arrived in 5 minutes. Run this again when you have copied it."; exit 1; fi
fi
printf '' | pbcopy
echo "1/3 saved on this Mac ($(wc -c < "$F" | tr -d ' ') characters), clipboard cleared"

if npx --yes netlify-cli env:set OPENAI_API_KEY "$(cat "$F")" --site "$SITE" < /dev/null > /dev/null 2>&1; then echo "2/3 set on Netlify (it takes effect at the next deploy)"
else echo "2/3 Netlify refused: run  npx netlify-cli login  once, then run this again."; exit 1; fi

out=$(curl -s -w $'\n%{http_code}' -X POST -H @<(printf 'Authorization: Bearer %s' "$(cat "$F")") -H 'content-type: application/json' \
  -d "{\"model\":\"$MODEL\",\"prompt\":\"A plain red circle on cream paper\",\"size\":\"1024x1024\",\"quality\":\"low\",\"n\":1}" https://api.openai.com/v1/images/generations)
code=${out##*$'\n'}; body=${out%$'\n'*}
case "$code" in
  200) echo "3/3 OpenAI made a test image with $MODEL: image generation is ready." ;;
  *)   why=$(printf '%s' "$body" | python3 -c "import sys,json;e=json.load(sys.stdin).get('error',{});print(e.get('code') or e.get('type') or 'unknown')" 2>/dev/null)
       echo "3/3 OpenAI answered $code ($why). 401: the key is wrong. 403: the key may not allow images. 429: add credit or raise the budget. 404 or model_not_found: tell Claude, the model name needs a check." ;;
esac
