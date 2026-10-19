(() => {
  "use strict";

  if (document.querySelector("#ppm-assistant")) return;

  const root = document.createElement("div");
  root.id = "ppm-assistant";
  root.innerHTML = `
    <button class="ppm-assistant-launcher" type="button" aria-label="Ask about PPM" aria-expanded="false" aria-controls="ppm-assistant-panel" title="Ask about PPM">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.4a7.4 7.4 0 0 1-7.4 7.4H6L3 21v-9.6A7.4 7.4 0 0 1 10.4 4H13a7 7 0 0 1 7 7.4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 10h7M8 14h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
    </button>
    <section class="ppm-assistant-panel" id="ppm-assistant-panel" aria-label="PPM site assistant" hidden>
      <header class="ppm-assistant-header">
        <span class="ppm-assistant-mark" aria-hidden="true"><i></i></span>
        <div><strong>Ask PPM</strong><small>Help with this prototype</small></div>
        <button class="ppm-assistant-new" type="button" aria-label="Start a new chat" title="Start a new chat">↻</button>
        <button class="ppm-assistant-close" type="button" aria-label="Close chat">×</button>
      </header>
      <div class="ppm-assistant-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
      <div class="ppm-assistant-suggestions" aria-label="Suggested questions">
        <button type="button">How does project evaluation work?</button>
        <button type="button">What can I do in Comparison?</button>
        <button type="button">How do I build a portfolio?</button>
      </div>
      <form class="ppm-assistant-form">
        <label class="sr-only" for="ppm-assistant-input">Ask a question about PPM</label>
        <textarea id="ppm-assistant-input" rows="1" maxlength="500" placeholder="Ask about the site…" required></textarea>
        <button type="submit" aria-label="Send message" title="Send message"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10 17 3l-4 14-3-6-7-1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m10 11 7-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
      </form>
      <p class="ppm-assistant-note">Checking assistant…</p>
    </section>`;
  document.body.append(root);

  const launcher = root.querySelector(".ppm-assistant-launcher");
  const panel = root.querySelector(".ppm-assistant-panel");
  const messages = root.querySelector(".ppm-assistant-messages");
  const suggestions = root.querySelector(".ppm-assistant-suggestions");
  const form = root.querySelector(".ppm-assistant-form");
  const input = root.querySelector("#ppm-assistant-input");
  const sendButton = form.querySelector("button[type='submit']");
  const note = root.querySelector(".ppm-assistant-note");
  const apiBase = String(window.PPM_CONFIG?.apiBaseUrl || "").replace(/\/$/, "");
  let assistantAvailable = null;
  let conversation = [];

  const topics = [
    {
      match: /\b(role|roles|proposer|reviewer|portfolio manager|permission|navigation)\b|역할|제안자|검토자|포트폴리오 매니저|메뉴/,
      en: "The prototype has three roles. Project Proposers enter project evidence, Reviewers assess five criteria with reasons, and Portfolio Managers set the investment context, compare projects, build candidate portfolios, review constraints, and record decisions. Choose a role from the role-selection screen; the left navigation then shows that role’s pages.",
      ko: "프로토타입에는 세 가지 역할이 있어요. Project Proposer는 프로젝트 근거를 입력하고, Reviewer는 다섯 기준을 근거와 함께 평가하며, Portfolio Manager는 투자 맥락 설정부터 비교·후보 포트폴리오·제약 검토·최종 결정까지 담당합니다. 역할 선택 화면에서 역할을 고르면 왼쪽 메뉴가 해당 역할의 화면으로 바뀝니다."
    },
    {
      match: /\b(proposal|propose|submit|project form|project entry|cost|staff|fte|timeline|benefit)\b|제안서|프로젝트 입력|제출|비용|인력|일정|혜택/,
      en: "A project proposal records its owner, primary objective, description, expected benefits, estimated cost, staff requirement, timeline, and risks or dependencies. The reviewer uses this evidence for the five-criterion assessment. The read-only demo shows the form but does not save a new proposal.",
      ko: "프로젝트 제안서에는 담당자, 주요 목표, 설명, 기대효과, 예상 비용, 필요 인력, 일정, 위험·의존성을 입력합니다. Reviewer는 이 근거를 바탕으로 다섯 기준을 평가해요. 읽기 전용 데모에서는 양식을 볼 수 있지만 새 제안서는 저장되지 않습니다."
    },
    {
      match: /\b(evaluation|evaluate|rating|score|criteria|criterion|risk manageability|rationale|review)\b|평가|점수|기준|근거|리뷰|위험 관리/,
      en: "Reviewers give separate 1–5 ratings for Strategic Alignment, Expected Business Value, Delivery Feasibility, Risk Manageability, and Time Criticality, with a short reason for each. For Risk Manageability, 5 means lower or easier-to-manage risk. PPM does not add the ratings into one total or make an automatic approval decision.",
      ko: "Reviewer는 전략적 정렬, 기대 비즈니스 가치, 실행 가능성, 위험 관리 가능성, 시급성에 각각 1–5점을 주고 짧은 근거를 남깁니다. Risk Manageability는 5점이 위험이 낮거나 관리하기 쉽다는 뜻이에요. PPM은 점수를 합산하거나 자동 승인 결정을 내리지 않습니다."
    },
    {
      match: /\b(compare|comparison|radar|chart|overlay|profile)\b|비교|레이더|차트|프로필/,
      en: "Comparison can show one evaluated project’s five-criterion radar profile, or overlay two to four selected projects. Use the ratings and reviewer reasons to discuss trade-offs; the chart does not calculate a winner or overall score. The temporary comparison selection is separate from the Shortlist.",
      ko: "평가가 끝난 프로젝트 하나를 선택하면 다섯 기준 레이더 프로필을 볼 수 있고, 두 개에서 네 개까지는 한 차트에 겹쳐 비교할 수 있어요. 점수와 검토자 근거로 장단점을 논의하며, 차트가 승자나 종합 점수를 계산하지 않습니다. 비교 선택은 Shortlist와 별개예요."
    },
    {
      match: /\b(shortlist|shortlist(ed|ing)?)\b|쇼트리스트|후보 목록|목록에 추가/,
      en: "The Shortlist keeps projects for further consideration after review. It is different from the temporary comparison selection and does not mean a project is approved. Shortlisted projects can then be considered in a candidate portfolio scenario.",
      ko: "Shortlist는 검토 후 더 살펴볼 프로젝트를 보관하는 목록이에요. 잠깐 비교할 프로젝트를 고르는 기능과 다르고, 승인 결정도 아닙니다. Shortlist에 담긴 프로젝트를 후보 포트폴리오 시나리오에서 조합할 수 있어요."
    },
    {
      match: /\b(scenario|portfolio|budget|constraint|capacity|resources|resource)\b|시나리오|포트폴리오|예산|제약|수용량|자원/,
      en: "In Build Candidate Portfolio, combine shortlisted projects into a scenario. PPM adds their estimated costs and staff requirements, then compares those totals with the budget and capacity set in Investment Context. A warning highlights an exceeded limit; being within limits is not an approval.",
      ko: "Build Candidate Portfolio에서 Shortlist 프로젝트를 시나리오로 조합합니다. PPM이 예상 비용과 인력 요구량을 더해 Investment Context에서 설정한 예산·수용량과 비교해요. 한도를 넘으면 경고가 표시되고, 한도 이내라는 이유만으로 승인되지는 않습니다."
    },
    {
      match: /\b(decision|approve|approval|defer|reject|human)\b|결정|승인|보류|거절|사람이/,
      en: "The Portfolio Manager records the final approve, defer, or reject decision and explains the rationale. The decision remains human-led; PPM organizes evidence and constraint checks but does not decide automatically.",
      ko: "Portfolio Manager가 승인·보류·거절 중 최종 결정을 기록하고 이유를 설명합니다. 결정은 사람이 내립니다. PPM은 근거와 제약 검토를 정리할 뿐 자동으로 결정하지 않아요."
    },
    {
      match: /\b(demo|live demo|screen guide|tour|sample|read.only|help|instruction|assisted)\b|데모|화면 안내|투어|샘플|도움|설명|안내/,
      en: "Choose a role to explore its read-only sample workspace. In the workplace, select Live demo for the guided walkthrough. On its first step, choose “View screen-by-screen guide” to browse compressed screenshots manually; there is no autoplay or video download. For help on a specific area, select the small i button, then choose the area on the page.",
      ko: "역할을 선택하면 해당 역할의 읽기 전용 샘플 화면을 둘러볼 수 있어요. Workplace에서 Live demo를 누르면 단계별 안내가 시작되고, 첫 단계에서 “View screen-by-screen guide”를 선택하면 압축된 화면 이미지를 직접 넘겨볼 수 있습니다. 자동 재생이나 동영상 다운로드는 없어요. 특정 영역의 도움말은 작은 i 버튼을 누른 뒤 해당 영역을 선택하면 됩니다."
    },
    {
      match: /\b(save|storage|stored|sync|synchroni[sz]e|account|database|data)\b|저장|동기화|계정|데이터베이스|데이터/,
      en: "Sample-workspace changes are read-only and are not saved. In the signed-in workplace, proposals and portfolio records are saved to the PPM account service and can sync when you sign in on another device. Avoid entering sensitive personal information in this prototype.",
      ko: "샘플 작업공간은 읽기 전용이라 변경 사항이 저장되지 않습니다. 로그인한 Workplace에서는 제안서와 포트폴리오 정보가 PPM 계정 서비스에 저장되고, 다른 기기에서도 같은 계정으로 로그인하면 동기화할 수 있어요. 프로토타입에는 민감한 개인정보를 입력하지 마세요."
    }
  ];

  function answerFor(question) {
    const topic = topics.find((item) => item.match.test(question));
    const isKorean = /[\u3131-\uD79D]/.test(question);
    if (topic) return isKorean ? topic.ko : topic.en;
    return isKorean
      ? "이 질문은 아직 안내 자료에 없어요. 역할, 프로젝트 평가, 레이더 비교, Shortlist, 포트폴리오 시나리오, 예산 제약, 최종 결정에 대해 물어보세요."
      : "I don’t have a clear answer for that in the prototype guide yet. Try asking about roles, project evaluation, radar comparison, the Shortlist, portfolio scenarios, budget checks, or final decisions.";
  }

  function setAssistantMode(enabled, unavailable = false) {
    assistantAvailable = enabled;
    const subtitle = root.querySelector(".ppm-assistant-header small");
    if (enabled) {
      subtitle.textContent = "AI help with this prototype";
      note.textContent = "AI replies · Messages go to an AI service. Don’t share sensitive information.";
    } else if (unavailable) {
      subtitle.textContent = "Site guide";
      note.textContent = "Guide mode · The AI service is unavailable; using built-in site answers.";
    } else {
      subtitle.textContent = "Site guide";
      note.textContent = "Guide mode · AI replies are not configured yet; built-in answers are available.";
    }
  }

  async function checkAssistantStatus() {
    if (!apiBase) {
      setAssistantMode(false, true);
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/assistant/status`, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Assistant status is unavailable");
      const data = await response.json();
      setAssistantMode(data.enabled === true);
    } catch {
      setAssistantMode(false, true);
    }
  }

  async function requestAssistantReply(question) {
    if (!apiBase || assistantAvailable === false) return answerFor(question);
    const response = await fetch(`${apiBase}/api/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ message: question, history: conversation.slice(-8) })
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 503) {
      setAssistantMode(false);
      return answerFor(question);
    }
    if (response.status === 429) {
      note.textContent = "AI demo limit reached for this minute · built-in site answers are still available.";
      return answerFor(question);
    }
    if (!response.ok || typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error(data.message || "Assistant reply failed");
    }
    setAssistantMode(true);
    return data.reply.trim();
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
    return message;
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

  async function sendQuestion(value) {
    const question = value.trim().slice(0, 500);
    if (!question) return;
    suggestions.hidden = true;
    addMessage(question, "user");
    input.value = "";
    input.disabled = true;
    sendButton.disabled = true;
    const pending = addMessage("One moment…", "assistant");
    pending.classList.add("is-pending");
    try {
      const answer = await requestAssistantReply(question);
      pending.querySelector("p").textContent = answer;
      conversation.push({ role: "user", content: question }, { role: "assistant", content: answer });
      conversation = conversation.slice(-8);
    } catch {
      const answer = answerFor(question);
      pending.querySelector("p").textContent = answer;
      pending.classList.remove("is-pending");
      setAssistantMode(false, true);
      conversation = [];
    } finally {
      pending.classList.remove("is-pending");
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
    messages.scrollTop = messages.scrollHeight;
  }

  addMessage("Hi! Ask me how a PPM screen or workflow works. I can explain the prototype and its sample data.", "assistant");
  launcher.addEventListener("click", () => panel.hidden ? openChat() : closeChat());
  root.querySelector(".ppm-assistant-close").addEventListener("click", closeChat);
  root.querySelector(".ppm-assistant-new").addEventListener("click", () => {
    messages.replaceChildren();
    suggestions.hidden = false;
    conversation = [];
    addMessage("Hi! Ask me how a PPM screen or workflow works. I can explain the prototype and its sample data.", "assistant");
    input.focus();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void sendQuestion(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  suggestions.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    openChat();
    void sendQuestion(button.textContent);
  }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closeChat();
  });
  void checkAssistantStatus();
})();
