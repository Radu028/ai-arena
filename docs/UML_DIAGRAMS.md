# UML Diagrams

This document contains the MDS-facing UML diagrams for AI Arena. Each diagram is
shown first as a committed SVG image so it renders consistently in Firefox,
Zen, Chromium-based browsers, and GitHub previews. The Mermaid source remains
below each image so the diagrams stay editable and reviewable in pull requests.

## 1. Use Case Diagram

![Use case diagram](diagrams/svg/01-use-case.svg)

```mermaid
flowchart LR
  Guest((Guest viewer))
  Voter((Guest voter))
  Admin((Admin))
  Model((AI model agent))
  Host((Host agent))
  Critic((Critic agent))
  Stats((Stats analyst agent))

  subgraph System["AI Arena"]
    ViewSession[View live session]
    JoinByQr[Join through QR/link/code]
    SubmitTopic[Submit round topic]
    Vote[Vote for anonymous response]
    WatchReveal[Watch winner reveal]
    ViewLeaderboard[View leaderboard/history]
    RegisterLogin[Register / login]
    CreateSession[Create session]
    StartStop[Start / stop session]
    ManageAdmins[Grant admin access]
    GenerateAnswers[Generate model answers]
    JudgeAnswers[Judge peer responses]
    HostCopy[Generate host copy]
    CriticCopy[Generate critic analysis]
    StatsCopy[Generate stats summary]
  end

  Guest --> ViewSession
  Guest --> JoinByQr
  Guest --> WatchReveal
  Guest --> ViewLeaderboard
  Voter --> SubmitTopic
  Voter --> Vote
  Admin --> RegisterLogin
  Admin --> CreateSession
  Admin --> StartStop
  Admin --> ManageAdmins
  Model --> GenerateAnswers
  Model --> JudgeAnswers
  Host --> HostCopy
  Critic --> CriticCopy
  Stats --> StatsCopy
```

## 2. Class / Domain Model Diagram

![Class / domain model diagram](diagrams/svg/02-domain-model.svg)

```mermaid
classDiagram
  class Session {
    +string slug
    +string joinCode
    +string title
    +SessionTheme theme
    +SessionStatus status
    +number roundCount
    +number currentRoundNumber
    +start()
    +stop()
  }

  class SessionParticipant {
    +ParticipantKind kind
    +string displayName
    +string accessTokenHash
    +join()
    +vote()
  }

  class Round {
    +number roundNumber
    +RoundStatus status
    +string topic
    +number votingEndsAt
    +RoundResultStatus resultStatus
    +submitTopic()
    +finalize()
  }

  class RoundResponse {
    +string providerKey
    +string modelKey
    +string anonymizedSlot
    +string responseText
    +ResponseStatus status
    +number latencyMs
    +number tokenUsageInput
    +number tokenUsageOutput
  }

  class HumanVote {
    +Id participantId
    +Id responseId
    +cast()
  }

  class AiVote {
    +string voterModelKey
    +Id responseId
    +string rationale
    +judge()
  }

  class RoundArtifact {
    +ArtifactType type
    +ArtifactStatus status
    +string content
    +string modelId
  }

  class AdminUser {
    +string email
    +string grantedByEmail
    +grantAccess()
  }

  class SessionEvent {
    +string type
    +string title
    +string description
  }

  Session "1" --> "*" SessionParticipant
  Session "1" --> "*" Round
  Session "1" --> "*" SessionEvent
  Round "1" --> "*" RoundResponse
  Round "1" --> "*" HumanVote
  Round "1" --> "*" AiVote
  Round "1" --> "*" RoundArtifact
  SessionParticipant "1" --> "*" HumanVote
  RoundResponse "1" --> "*" HumanVote
  RoundResponse "1" --> "*" AiVote
```

## 3. Round Sequence Diagram

![Round sequence diagram](diagrams/svg/03-round-sequence.svg)

```mermaid
sequenceDiagram
  autonumber
  actor Guest
  participant UI as React session page
  participant Convex as Convex mutations/queries
  participant Scheduler as Convex scheduler
  participant Orchestrator as orchestration.ts action
  participant Providers as OpenAI / Anthropic / Gemini

  Guest->>UI: Open QR/session link
  UI->>Convex: getPublicSessionView(slug)
  Convex-->>UI: Realtime session snapshot
  Guest->>UI: Submit topic
  UI->>Convex: submitTopic(slug, token, topic)
  Convex->>Scheduler: run generateRound
  Scheduler->>Orchestrator: generateRound(sessionId, roundId)
  Orchestrator->>Providers: Host intro + parallel model answers
  Providers-->>Orchestrator: Answers, latency, token usage
  Orchestrator->>Convex: save responses and open voting
  Orchestrator->>Providers: AI judge prompts
  Providers-->>Orchestrator: AI votes + rationales
  Orchestrator->>Convex: save AI votes
  Guest->>UI: Vote
  UI->>Convex: castHumanVote(slug, token, responseId)
  Scheduler->>Convex: finalizeRound after voting window
  Convex->>Scheduler: run afterRoundFinalized
  Scheduler->>Orchestrator: afterRoundFinalized
  Orchestrator->>Providers: Critic + Stats + Host transition/recap
  Orchestrator->>Convex: save artifacts
  Convex-->>UI: Winner reveal and agent summaries
```

## 4. Activity Diagram

![Activity diagram](diagrams/svg/04-activity-flow.svg)

```mermaid
flowchart TD
  Start([Open live session]) --> HasTopic{Round has topic?}
  HasTopic -- no --> Submit[Guest submits topic]
  Submit --> Lock[Convex validates and locks topic]
  HasTopic -- yes --> Generate
  Lock --> Generate[Generate model answers in parallel]
  Generate --> AnySuccess{Any successful responses?}
  AnySuccess -- no --> Abort[Abort round and log failure]
  AnySuccess -- yes --> Voting[Open anonymous voting]
  Voting --> HumanVotes[Collect human votes]
  Voting --> AiVotes[Collect AI judge votes]
  HumanVotes --> Close[Close voting window]
  AiVotes --> Close
  Close --> Score[Tally ballots]
  Score --> Reveal[Reveal model identities and winners]
  Reveal --> Artifacts[Generate Host, Critic, and Stats artifacts]
  Artifacts --> MoreRounds{More rounds?}
  MoreRounds -- yes --> NextRound[Open next topic collection]
  NextRound --> HasTopic
  MoreRounds -- no --> End([Session ended])
  Abort --> End
```

## 5. State Machine Diagram

![State machine diagram](diagrams/svg/05-state-machine.svg)

```mermaid
stateDiagram-v2
  [*] --> Waiting
  Waiting --> Active: admin starts session
  Active --> CollectingTopic: open round
  CollectingTopic --> Generating: first valid topic submitted
  Generating --> Voting: at least one model answer succeeds
  Generating --> Aborted: all model calls fail
  Voting --> Scored: voting timer closes / admin ends early
  Scored --> CollectingTopic: next round
  Scored --> Ended: final round complete
  Active --> Stopped: admin stops session
  Waiting --> Stopped: admin stops before start
  Aborted --> Stopped
  Ended --> [*]
  Stopped --> [*]
```

## 6. Deployment Diagram

![Deployment diagram](diagrams/svg/06-deployment.svg)

```mermaid
flowchart TB
  GitHub[(GitHub repository)]
  Actions[GitHub Actions CI/CD<br/>typecheck · lint · test · build · Convex deploy]
  Vercel[Vercel Production<br/>TanStack Start + Nitro SSR]
  Browser[User browser]
  Clerk[Clerk Auth<br/>register/login/JWT]
  Convex[Convex Cloud<br/>queries · mutations · actions · scheduler]
  DB[(Convex database)]
  OpenAI[OpenAI API]
  Anthropic[Anthropic API]
  Gemini[Google Gemini API]

  GitHub --> Actions
  GitHub --> Vercel
  Actions --> Convex
  Browser --> Vercel
  Browser <--> Convex
  Browser --> Clerk
  Clerk --> Convex
  Convex --> DB
  Convex --> OpenAI
  Convex --> Anthropic
  Convex --> Gemini
```

## How To View

Open this file on GitHub:

```text
https://github.com/Radu028/ai-arena/blob/main/docs/UML_DIAGRAMS.md
```

GitHub renders the committed SVG images in any modern browser. The Mermaid
blocks are kept as source. If a separate offline image is needed for slides, use
the SVG files in `docs/diagrams/svg/` directly.
