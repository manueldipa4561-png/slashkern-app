#!/bin/bash
# Run:  bash scripts/set-elevenlabs-key.sh   then create the key on ElevenLabs' API keys page and press its copy button.
# The script waits for the key on the clipboard, saves it privately on this Mac, sets it on Netlify, clears the clipboard and tests it. The key is never printed.
set -u
SITE=c8fb4186-2552-46b4-9afd-770d08ad7cc2 # the slashkern site on Netlify
VOICE=21m00Tcm4TlvDq8ikWAM                # the voice used for the test; the site's ELEVENLABS_VOICE_ID decides the real one
DIR="$HOME/.config/kern"; F="$DIR/elevenlabs-key"
mkdir -p "$DIR" && umask 077

# The key is whatever sk_ text lands on the clipboard (the old exposed key never counts). A key already copied is taken at once, else it waits up to 5 minutes.
fresh() { c=$(pbpaste | tr -d '[:space:]'); case "$c" in sk_43ca9f9*) return 1 ;; sk_*) printf '%s' "$c" > "$F"; return 0 ;; *) return 1 ;; esac; }
if ! fresh; then
  echo "Waiting for the new key. In ElevenLabs: Create API Key, switch Text to Speech to access, then press the copy button."
  for _ in $(seq 1 300); do sleep 1; fresh && break; done
  if [ ! -s "$F" ]; then echo "No new key arrived in 5 minutes. Run this again when you have copied it."; exit 1; fi
fi
printf '' | pbcopy
echo "1/3 saved on this Mac ($(wc -c < "$F" | tr -d ' ') characters), clipboard cleared"

if npx --yes netlify-cli env:set ELEVENLABS_API_KEY "$(cat "$F")" --site "$SITE" < /dev/null > /dev/null 2>&1; then echo "2/3 set on Netlify (it takes effect at the next deploy)"
else echo "2/3 Netlify refused: run  npx netlify-cli login  once, then run this again."; exit 1; fi

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H @<(printf 'xi-api-key: %s' "$(cat "$F")") -H 'content-type: application/json' \
  -d '{"text":"Hi.","model_id":"eleven_flash_v2_5"}' "https://api.elevenlabs.io/v1/text-to-speech/$VOICE?output_format=mp3_44100_64")
case "$code" in
  200) echo "3/3 ElevenLabs accepts the key: Slash's voice is ready." ;;
  401) echo "3/3 ElevenLabs refuses this key: edit it and switch Text to Speech to access, then run this again." ;;
  *)   echo "3/3 ElevenLabs answered $code: try again in a minute." ;;
esac
