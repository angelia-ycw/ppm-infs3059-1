(() => {
  "use strict";

  if (document.querySelector("#ppm-assistant")) return;

  const root = document.createElement("div");
  root.id = "ppm-assistant";
  root.innerHTML = `
    <button class="ppm-assistant-launcher" type="button" aria-label="Ask about PPM" aria-expanded="false" aria-controls="ppm-assistant-panel" title="Ask about PPM">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.4a7.4 7.4 0 0 1-7.4 7.4H6L3 21v-9.6A7.4 7.4 0 0 1 10.4 4H13a7 7 0 0 1 7 7.4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 10h7M8 14h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
    </button>
    <section class="ppm-assistant-panel" id="ppm-assistant-panel" aria-label="PPM site guide" hidden>
      <header class="ppm-assistant-header">
        <span class="ppm-assistant-mark" aria-hidden="true"><i></i></span>
        <div><strong>PPM guide</strong><small>Ask in your own words</small></div>
        <button class="ppm-assistant-new" type="button" aria-label="Start a new chat" title="Start a new chat">↻</button>
        <button class="ppm-assistant-close" type="button" aria-label="Close chat">×</button>
      </header>
      <div class="ppm-assistant-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
      <form class="ppm-assistant-form">
        <label class="sr-only" for="ppm-assistant-input">Type a question about PPM</label>
        <textarea id="ppm-assistant-input" rows="1" maxlength="500" placeholder="Type a question about PPM…" required></textarea>
        <button type="submit" aria-label="Send message" title="Send message"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10 17 3l-4 14-3-6-7-1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m10 11 7-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
      </form>
      <p class="ppm-assistant-note">Offline guide · English questions matched to built-in PPM help. No AI service or account is needed.</p>
    </section>`;
  document.body.append(root);

  const launcher = root.querySelector(".ppm-assistant-launcher");
  const panel = root.querySelector(".ppm-assistant-panel");
  const messages = root.querySelector(".ppm-assistant-messages");
  const form = root.querySelector(".ppm-assistant-form");
  const input = root.querySelector("#ppm-assistant-input");
  const sendButton = form.querySelector("button[type='submit']");

  // The guide scores phrases in the typed question and returns the closest built-in answer.
  // It deliberately does not call an AI provider, send the question elsewhere, or store chat history.
  const topics = [
    {
      keywords: ["type a question", "type my own question", "own words", "free text", "write a question", "pick a topic", "choose a topic", "select a topic", "choose from buttons", "without selecting", "no topic selected", "free form", "question in my own words", "ask a question", "question box", "질문 입력", "직접 입력", "자유롭게 질문", "고르는 게 아니라", "고르는게 아니라", "주제 선택", "주제를 고르", "버튼을 고르", "뭘 물어볼 수"],
      en: "You can type a question in your own words; you do not need to choose a topic or press a suggested-question button. The offline guide looks for related words and phrases, then returns the closest prepared PPM answer. It is not a generative AI, so it may ask you to rephrase if it cannot find a close match.",
      ko: "주제를 고르지 않아도 되고, 추천 질문 버튼을 누를 필요도 없어요. 궁금한 내용을 채팅창에 평소 말투로 직접 입력하면 오프라인 안내가 관련 단어와 표현을 찾아 가장 가까운 PPM 답변을 보여줍니다. 생성형 AI는 아니라서 맞는 답을 못 찾으면 질문을 다시 표현해 달라고 안내할 수 있어요."
    },
    {
      keywords: ["role", "roles", "proposer", "reviewer", "portfolio manager", "role selection", "who does", "which role", "permission", "navigation", "역할", "역할별", "역할 선택", "역할선택", "제안자", "검토자", "매니저", "권한", "메뉴"],
      en: "There are three roles: Project Proposer submits project evidence, Reviewer rates the five criteria and records reasons, and Portfolio Manager sets the investment context, compares and shortlists projects, builds candidate portfolios, checks constraints, and records decisions. Choose a role on the role-selection screen; its navigation shows the pages for that role. The sample role experience is read-only.",
      ko: "역할은 세 가지예요. Project Proposer는 프로젝트 근거를 제출하고, Reviewer는 다섯 기준을 평가해 이유를 남기며, Portfolio Manager는 투자 맥락 설정부터 비교·Shortlist·후보 포트폴리오·제약 검토·최종 결정까지 담당합니다. 역할 선택 화면에서 역할을 고르면 해당 역할의 메뉴가 보여요. 샘플 역할 체험은 읽기 전용입니다."
    },
    {
      keywords: ["investment context", "planning context", "planning cycle", "planning period", "planning phase", "planning stage", "planning timeframe", "planning activities", "portfolio planning", "start of planning", "beginning of the cycle", "set up a planning cycle", "before proposals", "before projects are submitted", "what should i do during planning", "business unit", "planning horizon", "staff capacity", "budget limit", "set objectives", "investment goals", "strategic goals", "objectives", "goals", "set budget", "budget", "capacity", "투자 맥락", "투자 컨텍스트", "맥락 설정", "계획 주기", "계획 기간", "사업부", "예산", "인력 한도", "인력 용량", "목표 설정"],
      en: "At the start of a planning period, the Portfolio Manager sets the cycle details, objectives, total budget, and available staff capacity in Investment Context. Save that context before proposals are submitted. Later, candidate portfolio totals are checked against the budget and staff limits; being within those limits does not automatically approve a portfolio.",
      ko: "Investment Context에서는 제안서를 평가하기 전에 계획 주기, 목표, 예산, 사용 가능한 인력 규모를 설정합니다. 제안자는 각 프로젝트의 주요 목표를 선택해요. 이후 후보 포트폴리오의 비용과 인력 합계를 이 한도와 비교합니다. 한도 이내라고 자동 승인되는 것은 아닙니다."
    },
    {
      keywords: ["project proposal", "proposal form", "propose a project", "submit a project", "project entry", "project details", "expected benefit", "staff requirement", "timeline", "dependency", "cost", "fte", "제안서", "프로젝트 제안", "프로젝트 입력", "프로젝트 등록", "제출", "기대 효과", "기대효과", "담당자", "필요 인력", "일정", "비용", "의존성", "위험"],
      en: "A proposal should provide the project name and owner, primary objective, description, expected benefits, estimated cost, staff requirement, timeline, and known risks or dependencies. This evidence helps the Reviewer assess the project. In the read-only sample demo, you can inspect the proposal screens but cannot save a new proposal.",
      ko: "제안서에는 프로젝트명과 담당자, 주요 목표, 설명, 기대효과, 예상 비용, 필요 인력, 일정, 알려진 위험이나 의존성을 입력합니다. Reviewer가 이 정보를 근거로 프로젝트를 평가해요. 읽기 전용 샘플 데모에서는 제안 화면을 볼 수 있지만 새 제안서를 저장할 수는 없습니다."
    },
    {
      keywords: ["evaluation", "evaluate", "assessment", "assess", "assessed", "rating", "ratings", "score", "scoring", "5 mean", "what does 5 mean", "rating of 5", "five point scale", "criteria", "criterion", "review rationale", "reviewer reason", "risk", "risk score", "risk rating", "risk manageability", "strategic alignment", "feasibility", "urgency", "평가", "평가하기", "점수", "기준", "평가 기준", "근거", "검토 이유", "리뷰", "위험 관리", "시급성", "실행 가능성"],
      en: "The Reviewer gives separate 1–5 ratings for Strategic Alignment, Expected Business Value, Delivery Feasibility, Risk Manageability, and Time Criticality, and adds a short reason for each rating. For Risk Manageability, 5 means the risk is lower or easier to manage. PPM does not add ratings into one overall score or make an automatic decision.",
      ko: "Reviewer는 Strategic Alignment, Expected Business Value, Delivery Feasibility, Risk Manageability, Time Criticality에 각각 1–5점을 주고 각 점수의 짧은 근거를 적습니다. Risk Manageability는 5점일수록 위험이 낮거나 관리하기 쉽다는 뜻이에요. PPM은 점수를 하나의 총점으로 합치거나 자동 결정을 내리지 않습니다."
    },
    {
      keywords: ["not reviewed", "not reviewed yet", "not assessed", "unassessed", "unreviewed", "awaiting review", "pending review", "no review yet", "under review", "review status", "evaluation status", "submitted", "submission", "submitted for review", "reviewed yet", "review needed", "review not required", "reviewer needs", "assessment pending", "waiting for review", "has not been assessed", "has not been reviewed"],
      en: "A submitted proposal that has not yet been assessed is shown as awaiting review; once a Reviewer starts or records an assessment, its status changes accordingly. “Awaiting review” means it has not been reviewed yet, not that a review is unnecessary. The project’s evaluation page is where ratings and rationales are recorded.",
      ko: "제출 후 아직 평가되지 않은 제안서는 검토 대기 상태로 표시됩니다. Reviewer가 평가를 시작하거나 기록하면 상태가 그에 맞게 바뀝니다. ‘검토 대기’는 아직 검토가 안 됐다는 뜻이지, 검토가 필요 없다는 뜻이 아니에요. 점수와 근거는 Project Evaluation에서 기록합니다."
    },
    {
      keywords: ["search", "filter", "sort", "find projects", "project list", "by status", "by cost", "strategic objective", "검색", "찾기", "필터", "정렬", "프로젝트 목록", "상태별", "비용별", "목표별", "전략 목표"],
      en: "In Project Overview, use search to find proposals and filters to narrow the list by available project attributes such as objective, status, risk, feasibility, or cost. Sorting changes the display order; it does not change project ratings or make a recommendation.",
      ko: "Project Overview에서 검색으로 제안서를 찾고, 제공되는 필터를 사용해 목표·상태·위험·실행 가능성·비용 등에 따라 목록을 좁힙니다. 정렬은 화면의 표시 순서만 바꾸며 점수나 추천 결과를 바꾸지 않습니다."
    },
    {
      keywords: ["comparison", "compare", "radar", "radar chart", "chart", "overlay", "one project", "single project", "four projects", "side by side", "비교", "레이더", "레이더 차트", "차트", "한 프로젝트", "하나만", "한 개", "겹쳐", "나란히 비교"],
      en: "Comparison shows a five-criterion radar profile even when one evaluated project is selected. Select two to four projects to overlay their profiles for side-by-side comparison. The chart visualizes ratings; it does not rank projects, calculate a winner, or replace the reviewer’s rationale.",
      ko: "평가된 프로젝트를 하나만 선택해도 Comparison에서 다섯 기준 레이더 프로필을 볼 수 있어요. 두 개에서 네 개를 선택하면 프로필을 한 차트에 겹쳐 비교합니다. 차트는 평가 점수를 시각화할 뿐 프로젝트 순위나 승자를 계산하지 않고, Reviewer의 근거를 대신하지도 않습니다."
    },
    {
      keywords: ["shortlist", "short-listed", "short list", "save for later", "further consideration", "shortlist vs comparison", "쇼트리스트", "후보 목록", "후보로", "나중에 검토", "추가 검토", "비교 목록"],
      en: "Shortlist is a saved set of projects for further consideration. It is different from selecting projects temporarily for Comparison, and it does not mean they are approved. Shortlisted projects can be considered when building a candidate portfolio.",
      ko: "Shortlist는 나중에 더 검토할 프로젝트를 담아두는 목록입니다. Comparison에서 잠시 비교할 프로젝트를 선택하는 것과 다르고, 승인됐다는 뜻도 아니에요. Shortlist에 담긴 프로젝트를 후보 포트폴리오 구성에 사용할 수 있습니다."
    },
    {
      keywords: ["candidate portfolio", "candidate scenario", "build portfolio", "portfolio scenario", "scenario", "shortlisted proposals", "shortlisted initiatives", "combine projects", "combined portfolio", "combined projects", "combined cost", "portfolio exceeds", "aggregate cost", "total cost", "resource requirement", "resource limit", "resource capacity", "resource constraints", "available resources", "available budget", "available staff", "staff capacity", "budget check", "budget overrun", "over budget", "over the budget", "goes over budget", "goes over the budget", "above budget", "exceeds budget", "exceeds the budget", "exceeds available", "exceeds capacity", "exceeds the limit", "scenario budget", "budget exceeded", "budget and staff", "budget and resources", "staff", "resources", "constraint", "shortage", "shortage of resources"],
      en: "Build Candidate Portfolio combines shortlisted projects into a candidate scenario. PPM adds the selected projects’ estimated costs and staff requirements, then checks the totals against the budget and capacity from Investment Context. It flags a limit that is exceeded. Passing the check is informational, not approval.",
      ko: "Build Candidate Portfolio에서는 Shortlist 프로젝트를 후보 시나리오로 조합합니다. 선택한 프로젝트의 예상 비용과 인력 요구량을 합산해 Investment Context의 예산·인력 한도와 비교하고, 초과한 항목을 표시해요. 한도 검토 통과는 참고 정보이며 승인을 뜻하지 않습니다."
    },
    {
      keywords: ["approve", "approval", "defer", "reject", "final decision", "decision rationale", "human decision", "승인", "보류", "거절", "최종 결정", "결정 이유", "사람이 결정", "자동 결정"],
      en: "The Portfolio Manager records the final approve, defer, or reject decision with a reason. This remains a human decision: the system organizes proposal evidence and portfolio constraints but does not automatically approve, defer, or reject projects.",
      ko: "Portfolio Manager가 승인·보류·거절 중 최종 결정을 이유와 함께 기록합니다. 결정은 사람이 내려요. 시스템은 제안 근거와 포트폴리오 제약을 정리하지만 프로젝트를 자동 승인·보류·거절하지 않습니다."
    },
    {
      keywords: ["demo", "live demo", "guided demo", "walkthrough", "video", "screenshots", "screen guide", "sample workspace", "read only", "read-only", "라이브 데모", "데모", "안내", "투어", "동영상", "영상", "이미지", "화면 안내", "샘플 작업공간", "읽기 전용"],
      en: "The Live demo is an optional guided walkthrough; it does not start automatically. It uses sample screens and is read-only. You can move through the walkthrough or use the screen-by-screen image guide. To try role-specific screens, go to role selection and choose a role. Demo changes are separate from saved workplace records.",
      ko: "Live demo는 자동 시작되지 않는 선택형 단계별 안내입니다. 샘플 화면을 사용하는 읽기 전용 체험이에요. 안내를 따라가거나 화면 이미지 가이드를 한 장씩 볼 수 있습니다. 역할별 화면을 보려면 역할 선택으로 가서 역할을 고르세요. 데모 변경은 저장된 Workplace 기록과 분리됩니다."
    },
    {
      keywords: ["assisted mode", "contextual help", "contextual guidance", "help button", "field help", "field instruction", "field explanation", "input box", "input guidance", "what to enter", "help for a field", "info button", "i button", "information icon", "tooltip", "instruction", "what do i do", "help with this step", "assisted", "도움말", "도움", "i 버튼", "아이 버튼", "정보 버튼", "안내 버튼", "툴팁", "이 단계", "뭘 해야", "무엇을 해야", "설명 보기"],
      en: "For help on a particular screen area, turn on the small i help control and then select the area you want explained. It opens a short contextual instruction for that field or section. The Live demo is a separate general tour of the workflow.",
      ko: "특정 화면 영역의 설명은 작은 i 도움말을 켠 다음, 설명이 필요한 영역을 선택하면 확인할 수 있어요. 그 입력칸이나 구역에서 해야 할 일을 짧게 안내합니다. Live demo는 전체 흐름을 둘러보는 별도의 일반 안내입니다."
    },
    {
      keywords: ["save", "saved", "storage", "sync", "synchronise", "synchronize", "another device", "account", "database", "local", "sample data", "workplace data", "저장", "저장돼", "동기화", "다른 기기", "계정", "데이터베이스", "로컬", "샘플 데이터", "작업공간 데이터"],
      en: "The sample demo is read-only and does not save your changes. In the signed-in workplace, records are stored through the configured PPM account service; using the same account on another device can sync them when the service and database are available. Avoid entering sensitive personal information in this prototype.",
      ko: "샘플 데모는 읽기 전용이라 변경 사항을 저장하지 않습니다. 로그인한 Workplace의 기록은 연결된 PPM 계정 서비스를 통해 저장되며, 서비스와 데이터베이스가 이용 가능할 때 같은 계정으로 다른 기기에서도 동기화할 수 있어요. 프로토타입에 민감한 개인정보를 입력하지 마세요."
    },
    {
      keywords: ["login", "sign in", "sign up", "create account", "without an account", "without creating an account", "no account needed", "account required", "account for demo", "demo without account", "do i need an account", "sample without account", "password", "authentication", "role after login", "로그인", "회원가입", "계정 만들기", "비밀번호", "인증", "가입"],
      en: "The site has a sign-in/account flow for the saved workplace. The read-only demo can be explored without creating an account. A role chosen for the demo only changes which sample workflow you see; it is not account authentication.",
      ko: "사이트의 저장형 Workplace에는 로그인·계정 흐름이 있고, 읽기 전용 데모는 계정을 만들지 않고 둘러볼 수 있습니다. 데모에서 고른 역할은 보여줄 샘플 흐름을 바꾸는 것이며 계정 인증은 아닙니다."
    },
    {
      keywords: ["feedback", "report a bug", "confusing", "suggestion", "prototype feedback", "피드백", "버그 신고", "오류 신고", "헷갈려", "제안", "의견"],
      en: "Use the Give Feedback link to share what you tried, what you expected, and what happened instead. Naming the screen and the action that felt confusing makes the feedback easier for the team to use.",
      ko: "Give Feedback 링크에서 시도한 작업, 기대한 결과, 실제로 일어난 일을 적어주세요. 헷갈렸던 화면과 누른 기능을 함께 적으면 팀이 피드백을 반영하기 쉬워집니다."
    },
    {
      keywords: ["what is ppm", "what does this site do", "what can i do", "about this site", "website purpose", "overview", "ppm", "project portfolio management", "이 사이트", "사이트 기능", "무엇을 할", "무슨 사이트", "ppm이 뭐", "프로토타입", "전체 기능"],
      en: "PPM supports a human-led IT project portfolio workflow: set investment context, submit project evidence, assess proposals against five criteria, compare and shortlist projects, build candidate portfolios, check budget and staff constraints, and record decisions. It does not calculate an automatic overall score or make final decisions.",
      ko: "PPM은 IT 프로젝트 포트폴리오 검토를 지원합니다. 투자 맥락 설정, 프로젝트 근거 제출, 다섯 기준 평가, 비교와 Shortlist, 후보 포트폴리오 구성, 예산·인력 제약 검토, 최종 결정 기록을 할 수 있어요. 자동 종합 점수나 자동 최종 결정은 제공하지 않습니다."
    }
  ];

  function normalize(value) {
    return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  }

  const stopWords = new Set("a an and are as at be by can do does for from how i in is it me my of on or our the this to what when where which who why with you your".split(" "));
  const topicDomains = [
    "question entry", "role selection", "investment context", "project proposal", "project evaluation", "review status",
    "project overview", "project comparison", "shortlist", "candidate portfolio", "portfolio decision", "live demo",
    "contextual help", "saved workplace", "account access", "user feedback", "PPM workflow"
  ];
  const subjectForms = [
    (phrase) => phrase,
    (phrase) => `the ${phrase}`,
    (phrase) => `my ${phrase}`,
    (phrase) => `this ${phrase}`,
    (phrase) => `${phrase} feature`,
    (phrase) => `${phrase} screen`,
    (phrase) => `${phrase} process`,
    (phrase) => `${phrase} workflow`,
    (phrase) => `the ${phrase} option`,
    (phrase) => `${phrase} in the PPM site`
  ];
  const questionFrames = [
    (subject, domain) => `How does ${subject} work in ${domain}?`,
    (subject, domain) => `How do I use ${subject} in ${domain}?`,
    (subject, domain) => `What is ${subject} in ${domain}?`,
    (subject, domain) => `What does ${subject} mean in ${domain}?`,
    (subject, domain) => `Can you explain ${subject} for ${domain}?`,
    (subject, domain) => `Can you tell me about ${subject} in ${domain}?`,
    (subject, domain) => `Where can I find ${subject} in ${domain}?`,
    (subject, domain) => `Where do I use ${subject} in ${domain}?`,
    (subject, domain) => `What can I do with ${subject} in ${domain}?`,
    (subject, domain) => `What should I know about ${subject} in ${domain}?`,
    (subject, domain) => `When do I use ${subject} in ${domain}?`,
    (subject, domain) => `Why do we use ${subject} in ${domain}?`,
    (subject, domain) => `Is ${subject} part of ${domain}?`,
    (subject, domain) => `Does PPM support ${subject} in ${domain}?`,
    (subject, domain) => `How does this site handle ${subject} in ${domain}?`,
    (subject, domain) => `What happens when I use ${subject} in ${domain}?`,
    (subject, domain) => `Can I edit ${subject} in ${domain}?`,
    (subject, domain) => `Can I save ${subject} in ${domain}?`,
    (subject, domain) => `Can I remove ${subject} in ${domain}?`,
    (subject, domain) => `Can I compare ${subject} in ${domain}?`,
    (subject, domain) => `How is ${subject} different in ${domain}?`,
    (subject, domain) => `What are the steps for ${subject} in ${domain}?`,
    (subject, domain) => `How do I get help with ${subject} in ${domain}?`,
    (subject, domain) => `Why is ${subject} confusing in ${domain}?`,
    (subject, domain) => `Can you help me with ${subject} in ${domain}?`,
    (subject, domain) => `Could you explain ${subject} in ${domain}?`,
    (subject, domain) => `What should I know about ${subject} in ${domain}?`,
    (subject, domain) => `Does the system calculate ${subject} in ${domain}?`,
    (subject, domain) => `How can I change ${subject} in ${domain}?`,
    (subject, domain) => `What happens before ${subject} in ${domain}?`,
    (subject, domain) => `What happens after ${subject} in ${domain}?`,
    (subject, domain) => `Is ${subject} available in the demo for ${domain}?`,
    (subject, domain) => `Can I see ${subject} in the demo for ${domain}?`,
    (subject, domain) => `Does ${subject} work across devices in ${domain}?`,
    (subject, domain) => `How does ${subject} connect to the portfolio in ${domain}?`,
    (subject, domain) => `Why is ${subject} important in ${domain}?`,
    (subject, domain) => `How can I check ${subject} in ${domain}?`,
    (subject, domain) => `Can you show me ${subject} in ${domain}?`,
    (subject, domain) => `Where is ${subject} in the ${domain} workflow?`,
    (subject, domain) => `Does ${subject} mean a project is approved in ${domain}?`,
    (subject, domain) => `Can I use ${subject} without logging in to ${domain}?`,
    (subject, domain) => `How do reviewers handle ${subject} in ${domain}?`,
    (subject, domain) => `How does the manager review ${subject} in ${domain}?`,
    (subject, domain) => `How do proposers add ${subject} in ${domain}?`,
    (subject, domain) => `How should I interpret ${subject} in ${domain}?`,
    (subject, domain) => `What is the purpose of ${subject} in ${domain}?`,
    (subject, domain) => `Can you help me understand ${subject} in ${domain}?`,
    (subject, domain) => `What should I do about ${subject} in ${domain}?`,
    (subject, domain) => `How does the workflow move from ${subject} in ${domain}?`,
    (subject, domain) => `What does PPM do with ${subject} in ${domain}?`,
    (subject, domain) => `How can I change my ${subject} in ${domain}?`,
    (subject, domain) => `Is ${subject} saved automatically in ${domain}?`,
    (subject, domain) => `How do I find ${subject} in ${domain}?`,
    (subject, domain) => `Is ${subject} read only in ${domain}?`,
    (subject, domain) => `Can I add details to ${subject} in ${domain}?`,
    (subject, domain) => `Will ${subject} sync on another device in ${domain}?`,
    (subject, domain) => `How does ${subject} affect a decision in ${domain}?`,
    (subject, domain) => `How do I use ${subject} as a reviewer in ${domain}?`,
    (subject, domain) => `Is ${subject} automatic or human led in ${domain}?`,
    (subject, domain) => `Can I test ${subject} in ${domain}?`,
    (subject, domain) => `Can I start over with ${subject} in ${domain}?`
  ];

  function tokenize(value) {
    return normalize(value).split(" ").filter((word) => word.length > 1 && !stopWords.has(word));
  }

  function buildQuestionIndex() {
    const index = new Map();
    const seenQuestions = new Set();
    let count = 0;
    topics.forEach((topic, topicIndex) => {
      const subjects = new Set();
      topic.keywords.filter((keyword) => /^[a-z0-9 ]+$/i.test(keyword)).forEach((keyword) => {
        const phrase = normalize(keyword);
        subjectForms.forEach((format) => subjects.add(format(phrase)));
      });
      subjects.forEach((subject) => questionFrames.forEach((frame) => {
        const question = normalize(frame(subject, topicDomains[topicIndex]));
        if (seenQuestions.has(question)) return;
        seenQuestions.add(question);
        count += 1;
        const words = [...new Set(tokenize(question))];
        for (let size = 1; size <= 3; size += 1) {
          for (let start = 0; start + size <= words.length; start += 1) {
            const phrase = words.slice(start, start + size).join(" ");
            if (!index.has(phrase)) index.set(phrase, new Map());
            const topicsForPhrase = index.get(phrase);
            topicsForPhrase.set(topicIndex, (topicsForPhrase.get(topicIndex) || 0) + 1);
          }
        }
      }));
    });
    return { index, count };
  }

  const questionIndex = buildQuestionIndex();
  root.dataset.questionPatterns = String(questionIndex.count);
  root.querySelector(".ppm-assistant-note").textContent = `Offline guide · ${questionIndex.count.toLocaleString()} English question patterns matched to built-in PPM help. No AI service or account is needed.`;

  function phraseMatches(queryWords, termWords) {
    const allowedEndings = new Set(["s", "es", "ed", "ing", "er", "ers", "ly", "ment", "ments", "able", "ability", "al"]);
    for (let start = 0; start + termWords.length <= queryWords.length; start += 1) {
      let matched = true;
      for (let offset = 0; offset < termWords.length; offset += 1) {
        const term = termWords[offset];
        const word = queryWords[start + offset];
        if (word === term) continue;
        const ending = word.startsWith(term) ? word.slice(term.length) : "";
        if (term.length < 4 || !allowedEndings.has(ending)) {
          matched = false;
          break;
        }
      }
      if (matched) return true;
    }
    return false;
  }

  function scoreTopic(topic, normalized) {
    let score = 0;
    const queryWords = normalized.split(" ").filter(Boolean);
    topic.keywords.filter((keyword) => /^[a-z0-9 ]+$/i.test(keyword)).forEach((keyword) => {
      const term = normalize(keyword);
      if (phraseMatches(queryWords, term.split(" "))) {
        score += term.includes(" ") ? 4 : term.length >= 6 ? 3 : 2;
      }
    });
    return score;
  }

  function scoreQuestionPatterns(question) {
    const words = [...new Set(tokenize(question))];
    const scores = new Array(topics.length).fill(0);
    for (let size = 1; size <= 3; size += 1) {
      for (let start = 0; start + size <= words.length; start += 1) {
        const matches = questionIndex.index.get(words.slice(start, start + size).join(" "));
        if (!matches) continue;
        const phraseWeight = size === 1 ? 0.5 : size === 2 ? 1.4 : 2.4;
        const topicBreadthWeight = 1 / Math.sqrt(matches.size);
        matches.forEach((patternCount, topicIndex) => {
          scores[topicIndex] += phraseWeight * topicBreadthWeight * Math.min(2, Math.log2(patternCount + 1));
        });
      }
    }
    return scores;
  }

  function answerFor(question) {
    const normalized = normalize(question);
    const patternScores = scoreQuestionPatterns(question);
    const ranked = topics.map((topic, index) => {
      const direct = scoreTopic(topic, normalized);
      const pattern = patternScores[index];
      return { topic, score: direct * 2 + pattern, direct, pattern };
    }).sort((left, right) => right.score - left.score);

    if (!ranked.length || (ranked[0].direct === 0 && ranked[0].pattern < 2)) {
      return "I couldn’t match that wording to a guide answer yet. Rephrase it naturally or include the screen or feature name. I can help with roles, objectives and budget, proposals, evaluation, comparison, Shortlist, portfolios, the demo, or saving data.";
    }

    const selected = [ranked[0]];
    const asksMultiple = /\b(and|also|plus|both)\b/.test(normalized);
    if (asksMultiple && ranked[1] && ranked[1].score >= 5 && ranked[1].score >= ranked[0].score * 0.55) {
      selected.push(ranked[1]);
    }
    return selected.map(({ topic }) => topic.en).join("\n\n");
  }

  function addMessage(text, sender) {
    const message = document.createElement("article");
    message.className = `ppm-assistant-message is-${sender}`;
    message.setAttribute("aria-label", sender === "user" ? "You" : "PPM guide");
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    message.append(paragraph);
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function openChat() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closeChat() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  function sendQuestion(value) {
    const question = value.trim().slice(0, 500);
    if (!question) return;
    addMessage(question, "user");
    input.value = "";
    input.disabled = true;
    sendButton.disabled = true;
    addMessage(answerFor(question), "assistant");
    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
  }

  addMessage("Type your question and I'll help.", "assistant");
  launcher.addEventListener("click", () => panel.hidden ? openChat() : closeChat());
  root.querySelector(".ppm-assistant-close").addEventListener("click", closeChat);
  root.querySelector(".ppm-assistant-new").addEventListener("click", () => {
    messages.replaceChildren();
    addMessage("Type your question and I'll help.", "assistant");
    input.focus();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendQuestion(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closeChat();
  });
})();
