function insertText(text) {
  const cursor = document.getElementById('text-input');

  // タイトルの上書きを抑制する
  if (cursor.classList.contains('line-title')) {
    return;
  }
  cursor.focus();
  const start = cursor.selectionStart;
  cursor.setRangeText(text);
  cursor.selectionStart = start + text.length;
  cursor.selectionEnd = cursor.selectionStart;
  const uiEvent = document.createEvent('UIEvent');
  uiEvent.initEvent('input', true, false);
  cursor.dispatchEvent(uiEvent);
}

async function getPreviousPage(baseTitle) {
  // 前回のページを探す
  const pageInfoResponse = await fetch(
    `https://scrapbox.io/api/pages/${project}/${encodeURIComponent(baseTitle)}`,
  );
  const pageInfo = await pageInfoResponse.json();

  let previousPage = null;
  for (const link of pageInfo.links) {
    if (
      (link.startsWith(baseTitle)
        && !link.endsWith('template')
        && previousPage === null)
      || link > previousPage
    ) {
      previousPage = link;
    }
  }
  return previousPage;
}

// eslint-disable-next-line no-undef
const project = scrapbox.Project.name;

async function fetchTemplate(baseTitle) {
  const templatePage = `${baseTitle} template`;
  const response = await fetch(
    `https://scrapbox.io/api/pages/${project}/${encodeURIComponent(templatePage)}/text`,
  );
  if (!response.ok) {
    return '';
  }
  const text = await response.text();
  return text.split('\n').slice(1).join('\n');
}

// eslint-disable-next-line no-undef
scrapbox.PageMenu.addMenu({
  title: '今日のページを作成する',
  image:
    'https://scrapbox.io/files/64b65b00d22b05001b350460.png?type=thumbnail',
  async onClick() {
    // eslint-disable-next-line no-undef
    const baseTitle = scrapbox.Page.title.replace(/ [0-9]{8}$/, '');
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10).replaceAll('-', '');
    // eslint-disable-next-line no-alert
    const date = window.prompt('日付を入力してください(YYYYMMDD)', currentDate);
    const title = `${baseTitle} ${date}`;
    insertText(` [${title}]`);

    const previousPage = await getPreviousPage(baseTitle);
    const template = await fetchTemplate(baseTitle);

    const body = previousPage === null ? template : `前回 [${previousPage}]\n${template}`;
    window.open(
      `/${project}/${title}?body=${encodeURIComponent(body)}`,
      '_blank',
    );
  },
});
