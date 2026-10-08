#!/bin/bash
# Room browser + host close: list, non-host refused, host closes, view reports closed, list drops it, join refused
B=http://localhost:3000/api/career-mp
C=$(curl -s -X POST $B/rooms -H 'content-type: application/json' -d '{"coachName":"Host"}')
CODE=$(echo "$C" | jq -r .code); TA=$(echo "$C" | jq -r .token)
J=$(curl -s -X POST $B/rooms/$CODE/join -H 'content-type: application/json' -d '{"coachName":"Gost"}')
TB=$(echo "$J" | jq -r .token)
V=$(curl -s $B/rooms/$CODE -H "x-coach-token: $TB" | jq -r .version)
echo "room $CODE v$V"
P=$(curl -s -w '\n%{http_code}' -X POST $B/rooms/$CODE/actions -H "x-coach-token: $TB" -H 'content-type: application/json' -d "{\"action\":{\"type\":\"pickCharacter\",\"slug\":\"vuka\"},\"expectVersion\":$V}")
echo "guest picks in the lobby (expect 200 vuka): $(echo "$P" | tail -1) $(echo "$P" | sed '$d' | jq -r '.view.coaches[] | select(.name=="Gost") | .slug')"
V=$(curl -s $B/rooms/$CODE -H "x-coach-token: $TB" | jq -r .version)
echo -n "listed before: "; curl -s $B/rooms | jq -c "[.rooms[] | select(.code==\"$CODE\") | {status, hostName, coaches: [.coaches[].name]}]"
echo -n "guest close (expect 403): "; curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/rooms/$CODE/actions -H "x-coach-token: $TB" -H 'content-type: application/json' -d "{\"action\":{\"type\":\"closeRoom\"},\"expectVersion\":$V}"
echo -n "host close (expect 200): "; curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/rooms/$CODE/actions -H "x-coach-token: $TA" -H 'content-type: application/json' -d "{\"action\":{\"type\":\"closeRoom\"},\"expectVersion\":$V}"
echo -n "guest view status (expect closed): "; curl -s $B/rooms/$CODE -H "x-coach-token: $TB" | jq -r .status
echo -n "listed after (expect false): "; curl -s $B/rooms | jq "[.rooms[].code] | index(\"$CODE\") != null"
echo -n "join closed (expect 410): "; curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/rooms/$CODE/join -H 'content-type: application/json' -d '{"coachName":"Treci"}'
echo -n "action on closed (expect 410): "; curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/rooms/$CODE/actions -H "x-coach-token: $TB" -H 'content-type: application/json' -d "{\"action\":{\"type\":\"ready\",\"ready\":true},\"expectVersion\":$((V+1))}"
