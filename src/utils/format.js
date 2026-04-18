/**
 * 格式化日期为 YYYY.MM.DD
 * @param {string|Date} iso - ISO 日期字符串或 Date 对象
 * @returns {string}
 */
export const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
};

/**
 * 获取球队的第一个标签（优先 allTags，其次 systemTags）
 * @param {Object} team
 * @returns {Object|null}
 */
export const getFirstTag = (team) => {
    const list = team?.allTags?.length ? team.allTags : team?.systemTags || [];
    return list[0] || null;
};

/**
 * 格式化标签显示文本（emoji + label）
 * @param {Object} tag - { emoji?: string, label?: string }
 * @returns {string}
 */
export const formatTagDisplay = (tag) => {
    if (!tag) return '';
    const label = tag.label || '';
    return tag.emoji ? `${tag.emoji} ${label}` : label;
};

/**
 * 生成球队成员数文案
 * @param {Object} team
 * @returns {string}
 */
export const formatMemberCount = (team) => {
    const n = team?.memberCount ?? 0;
    return `${n}人已加入`;
};
