#!/bin/bash
# Idle lobby clearing: a lobby untouched for more than LOBBY_IDLE_MS (10 min) is removed on the next request
B=http://localhost:3000/api/career-mp
NOW=$(date +%s000)
C=$(curl -s -X POST $B/rooms -H 'content-type: application/json' -H "x-career-mp-now: $NOW" -d '{"coachName":"Host"}')
CODE=$(echo "$C" | jq -r .code); TA=$(echo "$C" | jq -r .token)
echo "room $CODE"
echo -n "view at +9 min (expect 200): "; curl -s -o /dev/null -w '%{http_code}\n' $B/rooms/$CODE -H "x-coach-token: $TA" -H "x-career-mp-now: $((NOW + 9*60*1000))"
echo -n "listed at +18 min (touched at +9, expect true): "; curl -s $B/rooms -H "x-career-mp-now: $((NOW + 18*60*1000))" | jq "[.rooms[].code] | index(\"$CODE\") != null"
echo -n "view at +20 min (expect 410 expired): "; curl -s -w ' %{http_code}\n' $B/rooms/$CODE -H "x-coach-token: $TA" -H "x-career-mp-now: $((NOW + 20*60*1000))"
echo -n "view again (expect 404): "; curl -s -o /dev/null -w '%{http_code}\n' $B/rooms/$CODE -H "x-coach-token: $TA"
D=$(curl -s -X POST $B/rooms -H 'content-type: application/json' -H "x-career-mp-now: $NOW" -d '{"coachName":"Host2"}')
CODE2=$(echo "$D" | jq -r .code)
echo -n "second room listed at +11 min via list (expect false): "; curl -s $B/rooms -H "x-career-mp-now: $((NOW + 11*60*1000))" | jq "[.rooms[].code] | index(\"$CODE2\") != null"
echo -n "second room join after list cleared it (expect 404): "; curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/rooms/$CODE2/join -H 'content-type: application/json' -d '{"coachName":"Gost"}'
