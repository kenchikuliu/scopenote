export const MAX_CHANGES = 100;
export const STATUSES = ['pending', 'accepted', 'declined'];
export const emptyWorkspace = () => ({ version: 1, project: null, changes: [], isExample: false });

// Parse decimal strings directly into hundredths, avoiding floating-point currency input.
export function parseHundredths(input) {
  const raw = String(input).trim().replace(/^\./, '0.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return null;
  const [whole, fraction = ''] = raw.split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(result) ? result : null;
}

export const decimalInput = value => (value / 100).toFixed(2).replace(/\.00$/, '');
export const changeFee = change => Math.floor((change.hoursHundredths * change.rateCents + 50) / 100);

export function calculateTotals(data) {
  const totals = Object.fromEntries(STATUSES.map(status => [status, { fee: 0, hours: 0, count: 0 }]));
  for (const change of data.changes) {
    totals[change.status].fee += changeFee(change);
    totals[change.status].hours += change.hoursHundredths;
    totals[change.status].count += 1;
  }
  totals.baseline = data.project?.budgetCents ?? 0;
  totals.approved = totals.baseline + totals.accepted.fee;
  totals.estimated = totals.approved + totals.pending.fee;
  totals.totalHours = (data.project?.hoursHundredths ?? 0) + totals.accepted.hours + totals.pending.hours;
  return totals;
}

function validateText(value, max, required = true) {
  if (typeof value !== 'string') return 'required';
  if (required && !value.trim()) return 'required';
  return value.length > max ? 'tooLong' : null;
}

function numericField(value, max, allowZero = false) {
  const parsed = parseHundredths(value);
  if (parsed === null) return { error: 'invalidNumber' };
  if (parsed > max || parsed < (allowZero ? 0 : 1)) return { error: 'numberRange' };
  return { value: parsed };
}

export function validateProjectForm(fields, current, hasChanges) {
  const errors = {};
  for (const [key, max] of [['title', 120], ['client', 120], ['scope', 6000]]) {
    const error = validateText(fields[key], max);
    if (error) errors[key] = error;
  }
  const project = { title: fields.title?.trim(), client: fields.client?.trim(), scope: fields.scope?.trim(), currency: fields.currency };
  for (const [input, output, max, zero] of [['budget', 'budgetCents', 10000000000, true], ['hours', 'hoursHundredths', 1000000, false], ['rate', 'rateCents', 10000000, false]]) {
    const result = numericField(fields[input], max, zero);
    if (result.error) errors[input] = result.error;
    else project[output] = result.value;
  }
  if (!['USD', 'CNY'].includes(fields.currency)) errors.currency = 'invalidCurrency';
  if (hasChanges && current && fields.currency !== current.currency) errors.currency = 'currencyLocked';
  return { errors, project };
}

export function validateChangeForm(fields) {
  const errors = {};
  for (const [key, max, required] of [['title', 120, true], ['deliverable', 3000, true], ['source', 3000, true], ['decisionNote', 2000, false]]) {
    const error = validateText(fields[key], max, required);
    if (error) errors[key] = error;
  }
  const values = Object.fromEntries(['title', 'deliverable', 'source', 'decisionNote'].map(key => [key, fields[key]?.trim() ?? '']));
  for (const [input, output, max] of [['hours', 'hoursHundredths', 1000000], ['rate', 'rateCents', 10000000]]) {
    const result = numericField(fields[input], max);
    if (result.error) errors[input] = result.error;
    else values[output] = result.value;
  }
  if (!STATUSES.includes(fields.status)) errors.status = 'invalidStatus';
  values.status = fields.status;
  return { errors, values };
}

export function applyChangeEdit(previous, values, now = new Date().toISOString()) {
  const changedQuote = ['title', 'deliverable', 'source', 'hoursHundredths', 'rateCents'].some(key => previous[key] !== values[key]);
  const reconfirmation = previous.status === 'accepted' && values.status === 'accepted' && changedQuote;
  const change = { ...previous, ...values, updatedAt: now };
  if (reconfirmation) {
    change.status = 'pending';
    change.decisionNote = '';
  }
  return { change, reconfirmation };
}

export function formatMoney(cents, currency = 'USD', locale = 'zh', compact = false) {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : locale === 'zh' ? 'zh-CN' : 'en-US', {
    style: 'currency', currency, minimumFractionDigits: compact && cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatHours(hundredths, locale = 'zh') {
  return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 2 }).format(hundredths / 100);
}

export function syntheticExample(locale = 'zh') {
  const zh = locale === 'zh';
  const titles = zh ? ['增加博客页面', '调整整站配色', '额外文案修改'] : ['Add a blog page', 'Refresh the color palette', 'Additional copy revisions'];
  const deliverables = zh ? ['新增文章列表与文章详情模板，适配移动端。', '更新全站颜色、按钮状态与插图背景。', '额外一轮首页及产品介绍文案修改。'] : ['Add a post list and article template, including mobile layouts.', 'Update site colors, button states, and illustration backgrounds.', 'One extra round of homepage and product copy revisions.'];
  const sources = zh ? ['“我们还想要一个博客，可以顺便加上文章详情吗？”', '“现在的颜色有点深，可以换成浅色系列吗？”', '“文案我们又讨论了一下，想再改一轮。”'] : ['“Could we also add a blog, with an individual article page?”', '“Could we change the site to a lighter color palette?”', '“We have discussed the copy again and would like another revision.”'];
  const now = '2026-10-14T08:00:00.000Z';
  return {
    version: 1, isExample: true,
    project: { title: zh ? '小森林 · 品牌落地页' : 'Little Forest · Brand landing page', client: zh ? '小森林工作室（虚构）' : 'Little Forest Studio (fictional)', scope: zh ? '一页品牌落地页：首屏、产品介绍、关于我们与联系表单。\n包含桌面与移动端适配，以及两轮修改。\n不包含博客、额外页面与第三轮修改。' : 'One brand landing page: hero, product overview, about, and contact form.\nDesktop and mobile layouts, with two revision rounds.\nBlog, additional pages, and a third revision round are outside the agreement.', currency: 'USD', budgetCents: 200000, hoursHundredths: 2000, rateCents: 10000 },
    changes: [1000, 800, 500].map((hoursHundredths, index) => ({ id: `example-${index + 1}`, title: titles[index], deliverable: deliverables[index], source: sources[index], hoursHundredths, rateCents: 10000, status: 'pending', decisionNote: '', createdAt: now, updatedAt: now })),
  };
}

const boundedInteger = (value, max, min = 0) => Number.isSafeInteger(value) && value >= min && value <= max;
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;

// Return only whitelisted properties; imported data never supplies arbitrary application state.
export function validateWorkspace(input) {
  const invalid = { ok: false, error: 'invalidBackup' };
  if (!input || typeof input !== 'object' || input.version !== 1 || typeof input.isExample !== 'boolean' || !Array.isArray(input.changes) || input.changes.length > MAX_CHANGES) return invalid;
  if (input.project === null) return input.changes.length === 0 ? { ok: true, data: emptyWorkspace() } : invalid;
  const p = input.project;
  if (!p || ['title', 'client', 'scope'].some(key => validateText(p[key], key === 'scope' ? 6000 : 120)) || !['USD', 'CNY'].includes(p.currency) || !boundedInteger(p.budgetCents, 10000000000) || !boundedInteger(p.hoursHundredths, 1000000, 1) || !boundedInteger(p.rateCents, 10000000, 1)) return invalid;
  const project = Object.fromEntries(['title', 'client', 'scope', 'currency', 'budgetCents', 'hoursHundredths', 'rateCents'].map(key => [key, p[key]]));
  const ids = new Set();
  const changes = [];
  for (const c of input.changes) {
    if (!c || validateText(c.id, 100) || ids.has(c.id) || validateText(c.title, 120) || validateText(c.deliverable, 3000) || validateText(c.source, 3000) || validateText(c.decisionNote, 2000, false) || !boundedInteger(c.hoursHundredths, 1000000, 1) || !boundedInteger(c.rateCents, 10000000, 1) || !STATUSES.includes(c.status) || !validDate(c.createdAt) || !validDate(c.updatedAt)) return invalid;
    ids.add(c.id);
    changes.push(Object.fromEntries(['id', 'title', 'deliverable', 'source', 'hoursHundredths', 'rateCents', 'status', 'decisionNote', 'createdAt', 'updatedAt'].map(key => [key, c[key]])));
  }
  return { ok: true, data: { version: 1, project, changes, isExample: input.isExample } };
}
