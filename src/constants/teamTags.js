/**
 * 球队标签 key（与后端 tag.key 对齐，便于扩展）
 * @readonly
 */
export const TEAM_TAG_KEY = Object.freeze({
    /** 最近活跃 */
    ACTIVE: 'active',
    /** 活跃频繁 */
    FREQUENT: 'frequent',
    /** 还招人 */
    RECRUITING: 'recruiting',
    /** 有妹子 */
    HAS_FEMALE: 'hasFemale',
    /** 新球队 */
    NEW: 'new'
});

/**
 * tag.key → iconfont 类名（不含 iconfont 基础类）
 * @readonly
 */
export const TEAM_TAG_ICON_CLASS = Object.freeze({
    [TEAM_TAG_KEY.ACTIVE]: 'icon-huoyue',
    [TEAM_TAG_KEY.FREQUENT]: 'icon-huoyue',
    [TEAM_TAG_KEY.RECRUITING]: 'icon-zhaomu',
    [TEAM_TAG_KEY.HAS_FEMALE]: 'icon-nvren',
    [TEAM_TAG_KEY.NEW]: 'icon-new'
});

/**
 * @param {string} [key]
 * @returns {string} icon 类名，如 icon-huoyue；无映射时返回空串
 */
export const getTeamTagIconClassByKey = (key) => {
    if (!key || typeof key !== 'string') return '';
    return TEAM_TAG_ICON_CLASS[key] || '';
};
