#!/bin/zsh
set -u
B=http://localhost:3000/api/career-mp
NOW=$(date +%s000)
echo "== create"
C=$(curl -s -X POST $B/rooms -H 'content-type: application/json' -H "x-career-mp-now: $NOW" -d '{"coachName":"Vuka","settings":{"windowSeconds":60,"paperSeconds":60}}')
echo "$C" | jq -c '{code, coachId, status: .view.status, version: .view.version, coaches: (.view.coaches|length), slug: .view.coaches[0].slug}'
CODE=$(echo "$C" | jq -r .code); TA=$(echo "$C" | jq -r .token); A=$(echo "$C" | jq -r .coachId)
echo "== join by name only"
J=$(curl -s -X POST $B/rooms/$CODE/join -H 'content-type: application/json' -H "x-career-mp-now: $NOW" -d '{"coachName":"Cone"}')
echo "$J" | jq -c '{coachId, version: .view.version, coaches: [.view.coaches[] | {name, color, slug}]}'
TB=$(echo "$J" | jq -r .token); BID=$(echo "$J" | jq -r .coachId)
V=$(echo "$J" | jq -r .view.version)
echo "== join with taken name -> expect 409"
curl -s -o /dev/null -w "%{http_code}\n" -X POST $B/rooms/$CODE/join -H 'content-type: application/json' -d '{"coachName":"cone"}'
echo "== GET since=$V -> expect unchanged"
curl -s "$B/rooms/$CODE?since=$V" -H "x-coach-token: $TA" -H "x-career-mp-now: $NOW" | jq -c .
echo "== GET without token -> 401"
curl -s -o /dev/null -w "%{http_code}\n" "$B/rooms/$CODE"
act() { curl -s -w "\n%{http_code}" -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $1" -H "x-career-mp-now: $NOW" -d "{\"action\":$2,\"expectVersion\":$V}"; }
code() { echo "$1" | tail -1; }
body() { echo "$1" | sed '$d'; }
echo "== start before anyone picked -> expect 400 missing-slug"
R=$(act $TA '{"type":"start"}'); echo "$(code "$R") $(body "$R" | jq -r .error)"
echo "== lobby pick: A picks vuka -> 200"
R=$(act $TA '{"type":"pickCharacter","slug":"vuka"}'); echo "$(code "$R") $(body "$R" | jq -c '[.view.coaches[] | {name, slug}]')"
V=$(body "$R" | jq -r .view.version)
echo "== B picks vuka -> expect 409 character-taken"
R=$(act $TB '{"type":"pickCharacter","slug":"vuka"}'); echo "$(code "$R") $(body "$R" | jq -r .error)"
echo "== B picks an unknown slug -> expect 400 bad-slug"
R=$(act $TB '{"type":"pickCharacter","slug":"nobody"}'); echo "$(code "$R") $(body "$R" | jq -r .error)"
echo "== start while B has not picked -> expect 400 missing-slug"
R=$(act $TA '{"type":"start"}'); echo "$(code "$R") $(body "$R" | jq -r .error)"
echo "== B picks dax, then changes to cone -> 200 cone"
R=$(act $TB '{"type":"pickCharacter","slug":"dax"}'); V=$(body "$R" | jq -r .view.version)
R=$(act $TB '{"type":"pickCharacter","slug":"cone"}'); echo "$(code "$R") $(body "$R" | jq -c '[.view.coaches[] | {name, slug}]')"
V=$(body "$R" | jq -r .view.version)
echo "== old client joins with a taken slug -> expect 200 and no character, then leaves"
O=$(curl -s -X POST $B/rooms/$CODE/join -H 'content-type: application/json' -H "x-career-mp-now: $NOW" -d '{"coachName":"Oldie","slug":"vuka"}')
echo "$O" | jq -c '[.view.coaches[] | {name, slug}]'
TO=$(echo "$O" | jq -r .token); V=$(echo "$O" | jq -r .view.version)
R=$(act $TO '{"type":"leave"}'); V=$(body "$R" | jq -r .view.version); echo "left: $(code "$R")"
echo "== start while B is not ready -> expect 400 not-ready"
R=$(act $TA '{"type":"start"}'); echo "$(code "$R") $(body "$R" | jq -r .error)"
echo "== B is ready -> 200"
R=$(act $TB '{"type":"ready","ready":true}'); echo "$(code "$R") $(body "$R" | jq -c '[.view.coaches[] | {name, ready}]')"
V=$(body "$R" | jq -r .view.version)
echo "== start (host)"
ST=$(curl -s -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TA" -H "x-career-mp-now: $NOW" -d "{\"action\":{\"type\":\"start\"},\"expectVersion\":$V}")
echo "$ST" | jq -c '{status: .view.status, phase: .view.phase, version: .view.version, deadlineIn: ((.view.phase.deadline - .view.now)/1000), mail: (.view.career.mail|length), slug: .view.career.playerSlug, balance: .view.career.balance}'
V=$(echo "$ST" | jq -r .view.version)
echo "== pick after the start -> expect 409 league-started"
R=$(act $TB '{"type":"pickCharacter","slug":"dax"}'); echo "$(code "$R") $(body "$R" | jq -r .error)"
V=$(curl -s "$B/rooms/$CODE" -H "x-coach-token: $TA" -H "x-career-mp-now: $NOW" | jq -r .version)
echo "== start by non-host -> 403 (phase is window now so it is bad-phase 400)"
curl -s -o /dev/null -w "%{http_code}\n" -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TB" -d "{\"action\":{\"type\":\"start\"},\"expectVersion\":$V}"
echo "== read welcome mail (A) then train"
MAIL=$(curl -s "$B/rooms/$CODE" -H "x-coach-token: $TA" -H "x-career-mp-now: $NOW" | jq -r '.career.mail[0].id')
R=$(curl -s -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TA" -H "x-career-mp-now: $NOW" -d "{\"action\":{\"type\":\"readMail\",\"mailId\":\"$MAIL\"},\"expectVersion\":$V}")
echo "$R" | jq -c '{balance: .view.career.balance, version: .view.version}'
V=$(echo "$R" | jq -r .view.version)
T=$(curl -s -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TA" -H "x-career-mp-now: $NOW" -d "{\"action\":{\"type\":\"train\",\"trainingId\":\"fans\"},\"expectVersion\":$V}")
echo "$T" | jq -c '{receipt: {title: .receipt.title, money: .receipt.moneyDelta, scene: .receipt.scene, outcome: .receipt.outcome}, slots: .view.career.slotsUsed, balance: .view.career.balance, done: [.view.coaches[].done]}'
V=$(echo "$T" | jq -r .view.version)
echo "== B sees A's slot? (B view: coaches done flags, own slots)"
curl -s "$B/rooms/$CODE" -H "x-coach-token: $TB" -H "x-career-mp-now: $NOW" | jq -c '{slots: .career.slotsUsed, pendingSab: (.career.pendingSabotages|length), coaches: [.coaches[] | {name, done, balance, connected}]}'
echo "== stale expectVersion after a phase change: both Done -> paper, then A trains with the old version -> 409"
D1=$(curl -s -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TA" -H "x-career-mp-now: $NOW" -d "{\"action\":{\"type\":\"setDone\",\"done\":true},\"expectVersion\":$V}")
VA=$(echo "$D1" | jq -r .view.version)
D2=$(curl -s -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TB" -H "x-career-mp-now: $NOW" -d "{\"action\":{\"type\":\"setDone\",\"done\":true},\"expectVersion\":$VA}")
echo "$D2" | jq -c '{phase: .view.phase.kind, version: .view.version, lastIssue: (.view.career.lastIssue.news|length)}'
STALE=$(curl -s -w "\n%{http_code}" -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TA" -H "x-career-mp-now: $NOW" -d "{\"action\":{\"type\":\"train\",\"trainingId\":\"fans\"},\"expectVersion\":$V}")
echo "$STALE" | tail -1; echo "$STALE" | head -1 | jq -c '{error, phase: .view.phase.kind}'
echo "== timer expiry: paper has 60 s, GET with now+61s -> cup-pre (the bracket draw)"
LATER=$((NOW + 61000))
curl -s "$B/rooms/$CODE" -H "x-coach-token: $TA" -H "x-career-mp-now: $LATER" | jq -c '{phase: .phase.kind, deadline: .phase.deadline}'
echo "== both Done on the draw -> match-bets"
VV=$(curl -s "$B/rooms/$CODE" -H "x-coach-token: $TA" -H "x-career-mp-now: $LATER" | jq -r .version)
D1=$(curl -s -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TA" -H "x-career-mp-now: $LATER" -d "{\"action\":{\"type\":\"setDone\",\"done\":true},\"expectVersion\":$VV}")
VV=$(echo "$D1" | jq -r .view.version)
curl -s -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TB" -H "x-career-mp-now: $LATER" -d "{\"action\":{\"type\":\"setDone\",\"done\":true},\"expectVersion\":$VV}" | jq -c '.view | {phase: .phase.kind, stage: .phase.stage, index: .phase.index, deadlineIn: (if .phase.deadline then (.phase.deadline - .now)/1000 else null end), publicBets, connectedA: .coaches[0].connected}'
echo "== bets: expectVersion 0 is behind the phase -> stale; pass instead"
curl -s -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TA" -H "x-career-mp-now: $LATER" -d '{"action":{"type":"bet","side":"a"},"expectVersion":0}' | jq -c .error
VV=$(curl -s "$B/rooms/$CODE" -H "x-coach-token: $TA" -H "x-career-mp-now: $LATER" | jq -r .version)
P1=$(curl -s -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TA" -H "x-career-mp-now: $LATER" -d "{\"action\":{\"type\":\"pass\"},\"expectVersion\":$VV}")
VV=$(echo "$P1" | jq -r .view.version)
P2=$(curl -s -X POST $B/rooms/$CODE/actions -H 'content-type: application/json' -H "x-coach-token: $TB" -H "x-career-mp-now: $LATER" -d "{\"action\":{\"type\":\"pass\"},\"expectVersion\":$VV}")
echo "$P2" | jq -c '{phase: .view.phase.kind, closingIn: ((.view.phase.deadline - .view.now)/1000)}'
echo "== everyone passed arms the 5 s countdown; GET after it -> match-clip"
CLIPAT=$((LATER + 5200))
CLIP=$(curl -s "$B/rooms/$CODE" -H "x-coach-token: $TA" -H "x-career-mp-now: $CLIPAT")
echo "$CLIP" | jq -c '{phase: .phase.kind, index: .phase.index, durationMs: .phase.playback.durationMs, turns: (.phase.result.turns|length)}'
echo "== clip ends: start + duration + linger -> next match-bets"
DUR=$(echo "$CLIP" | jq -r .phase.playback.durationMs)
AFTER=$((CLIPAT + 3000 + DUR + 7000))
curl -s "$B/rooms/$CODE" -H "x-coach-token: $TB" -H "x-career-mp-now: $AFTER" | jq -c '{phase: .phase.kind, index: .phase.index, decided: ([.career.cup.rounds[0][] | select(.result)] | length)}'
echo "== unknown room -> 404"
curl -s -o /dev/null -w "%{http_code}\n" "$B/rooms/ZZZZZZ" -H "x-coach-token: x"
echo "== store kind"
echo CODE=$CODE
