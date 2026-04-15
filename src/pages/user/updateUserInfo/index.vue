<template>
    <div class="update-user-page">
        <nut-form ref="formRef" :model-value="form">
            <nut-form-item label="真实姓名" prop="realName">
                <nut-input v-model="form.realName" placeholder="请输入真实姓名" />
            </nut-form-item>
            <nut-form-item label="绰号" prop="nickname">
                <nut-input v-model="form.nickname" placeholder="场上或队友对你的称呼" />
            </nut-form-item>
            <nut-form-item is-link label="生日" prop="birthday" :rules="[
                { required: true, message: '请选择生日' },
                { validator: birthdayValidator, message: '请选择有效的出生日期' },
            ]">
                <nut-input :model-value="birthdayDisplayText" placeholder="请选择生日（年月日）" readonly is-link
                    @click="openBirthdayPicker" />
            </nut-form-item>
            <nut-form-item label="球龄" prop="yearsOfPlaying" is-link>
                <nut-input :model-value="yearsDisplayText" placeholder="请选择球龄" readonly @click="openYearsPicker" />
            </nut-form-item>
            <nut-form-item label="场上位置" prop="position" is-link>
                <nut-input :model-value="positionDisplayText" placeholder="请选择场上位置" readonly
                    @click="openPositionPicker" />
            </nut-form-item>
            <nut-form-item label="运动强度" prop="preferredIntensity" is-link>
                <nut-input :model-value="intensityDisplayText" placeholder="请选择运动强度" readonly
                    @click="openIntensityPicker" />
            </nut-form-item>
            <nut-form-item label="联系电话" prop="phone">
                <nut-input disabled :model-value="form.phone" type="text" max-length="11" placeholder="请输入手机号" />
            </nut-form-item>
            <nut-form-item label="所在地区" is-link>
                <nut-input :model-value="regionDisplayText" placeholder="请选择省市区" readonly is-link
                    @click="openRegionPicker" />
            </nut-form-item>
            <nut-form-item label="详细地址" prop="region.detail">
                <nut-input v-model="form.region.detail" type="text" placeholder="请输入详细地址" />
            </nut-form-item>
            <nut-form-item label="伤病详情" prop="injuryDetails">
                <nut-textarea v-model="form.injuryDetails" placeholder="无伤病可留空；如有请写明部位、时间、是否手术/康复情况、医生建议等"
                    :max-length="500" limit-show :rows="4" />
            </nut-form-item>
        </nut-form>

        <div class="footer-actions">
            <nut-button type="primary" block :loading="submitting" @click="handleSubmit">保存</nut-button>
        </div>

        <nut-popup v-model:visible="yearsVisible" position="bottom" safe-area-inset-bottom>
            <nut-picker v-model="yearsPickerValue" :columns="yearsColumns" title="选择球龄" @confirm="onYearsConfirm"
                @cancel="yearsVisible = false" />
        </nut-popup>

        <nut-popup v-model:visible="positionVisible" position="bottom" safe-area-inset-bottom>
            <nut-picker v-model="positionPickerValue" :columns="positionColumns" title="选择场上位置"
                @confirm="onPositionConfirm" @cancel="positionVisible = false" />
        </nut-popup>

        <nut-popup v-model:visible="intensityVisible" position="bottom" safe-area-inset-bottom>
            <nut-picker v-model="intensityPickerValue" :columns="intensityColumns" title="选择运动强度"
                @confirm="onIntensityConfirm" @cancel="intensityVisible = false" />
        </nut-popup>

        <nut-popup v-model:visible="birthdayVisible" position="bottom" safe-area-inset-bottom>
            <nut-picker v-model="birthdayPickerValue" :columns="birthdayColumns" title="选择生日"
                @confirm="onBirthdayConfirm" @cancel="birthdayVisible = false" />
        </nut-popup>

        <nut-popup v-model:visible="regionVisible" position="bottom" safe-area-inset-bottom>
            <nut-picker v-model="regionPickerValue" :columns="regionColumns" title="选择所在地区" @confirm="onRegionConfirm"
                @cancel="regionVisible = false" />
        </nut-popup>
    </div>
</template>

<script setup>
import { getUserInfoApi, updateUserInfoApi } from '@/api/user';
import { getRegionNamesByCodes, resolveRegionCodes, sichuanRegion } from '@/utils/regionData';
import { computed, watch } from 'vue';

const formRef = ref(null);
const submitting = ref(false);
const yearsVisible = ref(false);
const positionVisible = ref(false);
const intensityVisible = ref(false);
const birthdayVisible = ref(false);
const regionVisible = ref(false);

const form = reactive({
    realName: '',
    nickname: '',
    /** 出生日期，提交后端为 YYYY-MM-DD */
    birthday: '',
    phone: '',
    yearsOfPlaying: 0,
    position: 'UNKNOWN',
    preferredIntensity: 'UNKNOWN',
    region: {
        province: '',
        city: '',
        district: '',
        /** 街道门牌等详细地址 */
        detail: ''
    },
    injuryDetails: ''
});

const yearsColumns = (() => {
    const list = [{ text: '未设置（0 年）', value: '0' }];
    for (let y = 1; y <= 50; y += 1) {
        list.push({ text: `${y} 年`, value: String(y) });
    }
    return list;
})();

/** 与后端 PlayerPosition 枚举一致 */
const VALID_POSITIONS = ['UNKNOWN', 'PG', 'SG', 'SF', 'PF', 'C', 'GF', 'F', 'CPF', 'ALL'];

/** 与后端 preferredIntensity 枚举一致 */
const VALID_INTENSITIES = ['UNKNOWN', 'CASUAL', 'MODERATE', 'COMPETITIVE'];

const positionColumns = [
    { text: '未设置', value: 'UNKNOWN' },
    { text: '控球后卫 PG（1号位）', value: 'PG' },
    { text: '得分后卫 SG（2号位）', value: 'SG' },
    { text: '小前锋 SF（3号位）', value: 'SF' },
    { text: '大前锋 PF（4号位）', value: 'PF' },
    { text: '中锋 C（5号位）', value: 'C' },
    { text: '锋卫摇摆人（G/F）', value: 'GF' },
    { text: '前锋摇摆人（F，3/4号位）', value: 'F' },
    { text: '内线摇摆人（C/PF）', value: 'CPF' },
    { text: '不固定 / 全能位', value: 'ALL' }
];

const intensityColumns = [
    { text: '未设置', value: 'UNKNOWN' },
    { text: '休闲为主（出汗、养生局）', value: 'CASUAL' },
    { text: '中等对抗（常规半场/全场）', value: 'MODERATE' },
    { text: '高强度竞技（比赛、满强度）', value: 'COMPETITIVE' }
];

/** 旧版前端或中文缓存 → 后端枚举 */
const LEGACY_POSITION = {
    未设置: 'UNKNOWN',
    G_F: 'GF',
    F_FLEX: 'F',
    BIG_FLEX: 'CPF',
    FLEX: 'ALL'
};

const LEGACY_INTENSITY = {
    未设置: 'UNKNOWN',
    休闲为主: 'CASUAL',
    中等对抗: 'MODERATE',
    高强度竞技: 'COMPETITIVE'
};

function normalizePosition(raw) {
    const s = raw == null ? '' : String(raw).trim();
    if (!s) return 'UNKNOWN';
    if (LEGACY_POSITION[s]) return LEGACY_POSITION[s];
    if (VALID_POSITIONS.includes(s)) return s;
    const byText = positionColumns.find((c) => c.text === s);
    return byText ? byText.value : 'UNKNOWN';
}

function normalizeIntensity(raw) {
    const s = raw == null ? '' : String(raw).trim();
    if (!s) return 'UNKNOWN';
    if (LEGACY_INTENSITY[s]) return LEGACY_INTENSITY[s];
    if (VALID_INTENSITIES.includes(s)) return s;
    const byText = intensityColumns.find((c) => c.text === s);
    return byText ? byText.value : 'UNKNOWN';
}

const yearsPickerValue = ref(['0']);
const positionPickerValue = ref(['UNKNOWN']);
const intensityPickerValue = ref(['UNKNOWN']);
/** 生日选择器当前值 [年, 月, 日] 字符串，与 nut-picker 多列 value 一致 */
const birthdayPickerValue = ref(['1990', '01', '15']);

function pad2(n) {
    return String(Math.floor(n)).padStart(2, '0');
}

function todayParts() {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
}

function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/** 解析 YYYY-MM-DD */
function parseBirthdayStr(s) {
    if (s == null || s === '') return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
    if (!m) return null;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
    return { y, m: mo, d };
}

function isValidCalendarDate(y, m, d) {
    if (m < 1 || m > 12 || d < 1) return false;
    const dim = daysInMonth(y, m);
    return d <= dim;
}

function isNotFutureDate(y, m, d) {
    const { y: cy, m: cm, d: cd } = todayParts();
    if (y > cy) return false;
    if (y === cy && m > cm) return false;
    if (y === cy && m === cm && d > cd) return false;
    return true;
}

function birthdayValidator(val) {
    const p = parseBirthdayStr(val);
    if (!p) return false;
    if (!isValidCalendarDate(p.y, p.m, p.d)) return false;
    if (!isNotFutureDate(p.y, p.m, p.d)) return false;
    const { y: cy } = todayParts();
    if (p.y < cy - 120) return false;
    return true;
}

const birthdayColumns = computed(() => {
    const { y: cy, m: cm, d: cd } = todayParts();
    const yRaw = parseInt(birthdayPickerValue.value[0], 10);
    const ySel = Number.isFinite(yRaw)
        ? Math.min(cy, Math.max(cy - 120, yRaw))
        : cy - 30;

    const years = [];
    for (let y = cy - 120; y <= cy; y += 1) {
        years.push({ text: `${y}年`, value: String(y) });
    }

    const maxMonth = ySel === cy ? cm : 12;
    const mRaw = parseInt(birthdayPickerValue.value[1], 10);
    const mSel = Number.isFinite(mRaw) ? Math.min(maxMonth, Math.max(1, mRaw)) : 1;
    const months = [];
    for (let mo = 1; mo <= maxMonth; mo += 1) {
        months.push({ text: `${mo}月`, value: pad2(mo) });
    }

    const dim = daysInMonth(ySel, mSel);
    const maxDay = ySel === cy && mSel === cm ? Math.min(dim, cd) : dim;
    const days = [];
    for (let day = 1; day <= maxDay; day += 1) {
        days.push({ text: `${day}日`, value: pad2(day) });
    }

    return [years, months, days];
});

function clampBirthdayPicker() {
    const { y: cy, m: cm, d: cd } = todayParts();
    let y = parseInt(birthdayPickerValue.value[0], 10);
    let m = parseInt(birthdayPickerValue.value[1], 10);
    let d = parseInt(birthdayPickerValue.value[2], 10);
    if (!Number.isFinite(y)) y = cy - 30;
    y = Math.min(cy, Math.max(cy - 120, y));
    const maxM = y === cy ? cm : 12;
    if (!Number.isFinite(m)) m = 1;
    m = Math.min(maxM, Math.max(1, m));
    const dim = daysInMonth(y, m);
    const maxD = y === cy && m === cm ? Math.min(dim, cd) : dim;
    if (!Number.isFinite(d)) d = 1;
    d = Math.min(maxD, Math.max(1, d));
    const ny = String(y);
    const nm = pad2(m);
    const nd = pad2(d);
    const cur = birthdayPickerValue.value;
    if (!cur || cur[0] !== ny || cur[1] !== nm || cur[2] !== nd) {
        birthdayPickerValue.value = [ny, nm, nd];
    }
}

watch(birthdayPickerValue, () => {
    clampBirthdayPicker();
}, { deep: true });

const yearsDisplayText = computed(() => {
    const y = Number(form.yearsOfPlaying) || 0;
    if (y <= 0) return '未设置（0 年）';
    return `${y} 年`;
});

function positionLabelByValue(val) {
    const n = normalizePosition(val);
    const hit = positionColumns.find((c) => c.value === n);
    return hit ? hit.text : '未设置';
}

const positionDisplayText = computed(() => positionLabelByValue(form.position));

function intensityLabelByValue(val) {
    const n = normalizeIntensity(val);
    const hit = intensityColumns.find((c) => c.value === n);
    return hit ? hit.text : '未设置';
}

const intensityDisplayText = computed(() => intensityLabelByValue(form.preferredIntensity));

function mapRegionPickerColumn(list) {
    return (list || []).map((n) => ({ text: n.name, value: n.code }));
}

/** 省市区 Picker 绑定为 [省code, 市code, 区code] */
const regionPickerValue = ref(['510000', '510100', '510104']);

const regionColumns = computed(() => {
    const [pCode, cCode] = regionPickerValue.value;
    const p = sichuanRegion.find((x) => x.code === pCode) || sichuanRegion[0];
    const cities = mapRegionPickerColumn(p?.children);
    const cityNode = (p?.children || []).find((x) => x.code === cCode) || p?.children?.[0];
    const districts = mapRegionPickerColumn(cityNode?.children);
    return [mapRegionPickerColumn(sichuanRegion), cities, districts];
});

function clampRegionPicker() {
    const provs = mapRegionPickerColumn(sichuanRegion);
    let pCode = regionPickerValue.value[0];
    if (!provs.some((x) => x.value === pCode)) pCode = provs[0]?.value;
    const p = sichuanRegion.find((x) => x.code === pCode) || sichuanRegion[0];
    const cities = mapRegionPickerColumn(p?.children);
    let cCode = regionPickerValue.value[1];
    if (!cities.some((x) => x.value === cCode)) cCode = cities[0]?.value;
    const cityNode = (p?.children || []).find((x) => x.code === cCode);
    const districts = mapRegionPickerColumn(cityNode?.children);
    let dCode = regionPickerValue.value[2];
    if (!districts.some((x) => x.value === dCode)) dCode = districts[0]?.value;
    const next = [pCode, cCode, dCode];
    const cur = regionPickerValue.value;
    if (!cur || cur[0] !== next[0] || cur[1] !== next[1] || cur[2] !== next[2]) {
        regionPickerValue.value = next;
    }
}

watch(regionPickerValue, () => {
    clampRegionPicker();
}, { deep: true });

const regionDisplayText = computed(() => {
    const { province, city, district } = form.region;
    const parts = [province, city, district].filter(Boolean);
    return parts.join(' ');
});

function openRegionPicker() {
    regionPickerValue.value = resolveRegionCodes(
        form.region.province,
        form.region.city,
        form.region.district
    );
    clampRegionPicker();
    regionVisible.value = true;
}

function onRegionConfirm({ selectedValue }) {
    clampRegionPicker();
    const sv = selectedValue && selectedValue.length >= 3 ? selectedValue : regionPickerValue.value;
    const names = getRegionNamesByCodes(String(sv[0]), String(sv[1]), String(sv[2]));
    form.region.province = names.province;
    form.region.city = names.city;
    form.region.district = names.district;
    regionPickerValue.value = [String(sv[0]), String(sv[1]), String(sv[2])];
    regionVisible.value = false;
}

const birthdayDisplayText = computed(() => {
    const p = parseBirthdayStr(form.birthday);
    if (!p) return '';
    return `${p.y}年${p.m}月${p.d}日`;
});

function positionPickerValueFromForm() {
    return [normalizePosition(form.position)];
}


/**
 * 从本地缓存读取 userInfo。部分环境下 getStorageSync 可能得到 JSON 字符串，需解析。
 */
function readUserInfoFromStorage() {
    const raw = uni.getStorageSync('userInfo');
    if (raw == null || raw === '') return null;
    if (typeof raw === 'object' && raw !== null) return raw;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return typeof parsed === 'object' && parsed !== null ? parsed : null;
        } catch {
            return null;
        }
    }
    return null;
}

/** 与登录页一致：统一 phone 字段写入缓存 */
function normalizeUserInfoForStorage(userInfo) {
    if (!userInfo || typeof userInfo !== 'object') return userInfo;
    const phoneFromApi = userInfo.phone ?? userInfo.mobile ?? userInfo.phoneNumber ?? userInfo.tel;
    const normalizedPhone =
        phoneFromApi != null && String(phoneFromApi).trim() !== ''
            ? String(phoneFromApi).replace(/\D/g, '').slice(0, 11)
            : String(userInfo.phone || '').replace(/\D/g, '').slice(0, 11);
    return { ...userInfo, phone: normalizedPhone };
}

function applyUserProfile(src) {
    if (!src || typeof src !== 'object') return;


    const rawBirth = src.birthday ?? src.birthDate ?? src.dateOfBirth;
    if (rawBirth !== undefined && rawBirth !== null && String(rawBirth).trim() !== '') {
        const head = String(rawBirth).trim().slice(0, 10);
        const parsed = parseBirthdayStr(head);
        if (parsed) {
            form.birthday = `${parsed.y}-${pad2(parsed.m)}-${pad2(parsed.d)}`;
        }
    }
    form.realName = src.realName || '';
    form.phone = src.phone || '';
    form.nickname = src.nickname || '';

    if (src.yearsOfPlaying !== undefined && src.yearsOfPlaying !== null) {
        const n = Number(src.yearsOfPlaying);
        form.yearsOfPlaying = Number.isFinite(n) && n >= 0 ? Math.min(50, Math.floor(n)) : 0;
    }

    if (src.position !== undefined && src.position !== null && src.position !== '') {
        form.position = normalizePosition(src.position);
    }

    if (src.preferredIntensity !== undefined && src.preferredIntensity !== null) {
        form.preferredIntensity = normalizeIntensity(src.preferredIntensity);
    }

    if (src.region && typeof src.region === 'object') {
        if (src.region.province !== undefined) form.region.province = String(src.region.province || '');
        if (src.region.city !== undefined) form.region.city = String(src.region.city || '');
        if (src.region.district !== undefined) form.region.district = String(src.region.district || '');
        if (src.region.detail !== undefined && src.region.detail !== null) {
            form.region.detail = String(src.region.detail);
        }
    }

    if (src.injuryDetails !== undefined && src.injuryDetails !== null) {
        form.injuryDetails = String(src.injuryDetails);
    }
}

function openYearsPicker() {
    yearsPickerValue.value = [String(Math.min(50, Math.max(0, Number(form.yearsOfPlaying) || 0)))];
    yearsVisible.value = true;
}

function openPositionPicker() {
    positionPickerValue.value = positionPickerValueFromForm();
    positionVisible.value = true;
}

function openIntensityPicker() {
    intensityPickerValue.value = [normalizeIntensity(form.preferredIntensity)];
    intensityVisible.value = true;
}

function openBirthdayPicker() {
    const p = parseBirthdayStr(form.birthday);
    if (p) {
        birthdayPickerValue.value = [String(p.y), pad2(p.m), pad2(p.d)];
    } else {
        const { y: cy } = todayParts();
        birthdayPickerValue.value = [String(cy - 25), '06', '15'];
    }
    clampBirthdayPicker();
    birthdayVisible.value = true;
}

function onBirthdayConfirm({ selectedValue }) {
    clampBirthdayPicker();
    const sv = selectedValue && selectedValue.length >= 3 ? selectedValue : birthdayPickerValue.value;
    const ys = String(sv[0]);
    const ms = pad2(parseInt(String(sv[1]), 10));
    const ds = pad2(parseInt(String(sv[2]), 10));
    form.birthday = `${ys}-${ms}-${ds}`;
    birthdayVisible.value = false;
}

function onYearsConfirm({ selectedValue }) {
    const raw = selectedValue && selectedValue[0];
    const n = parseInt(String(raw), 10);
    form.yearsOfPlaying = Number.isFinite(n) && n >= 0 ? Math.min(50, n) : 0;
    yearsVisible.value = false;
}

function onPositionConfirm({ selectedOptions }) {
    const opt = selectedOptions && selectedOptions[0];
    if (opt) {
        form.position = opt.value;
        positionPickerValue.value = [opt.value];
    }
    positionVisible.value = false;
}

function onIntensityConfirm({ selectedOptions }) {
    const opt = selectedOptions && selectedOptions[0];
    if (opt) {
        form.preferredIntensity = opt.value;
        intensityPickerValue.value = [opt.value];
    }
    intensityVisible.value = false;
}

onMounted(async () => {
    const token = uni.getStorageSync('token');
    if (!token) {
        uni.reLaunch({ url: '/pages/login/index' });
        return;
    }

    try {
        const profile = await getUserInfoApi();
        applyUserProfile(profile);
    } catch (e) {
        console.error('getUserInfoApi', e);
        return;
    }

    yearsPickerValue.value = [String(form.yearsOfPlaying)];
    positionPickerValue.value = positionPickerValueFromForm();
    intensityPickerValue.value = [normalizeIntensity(form.preferredIntensity)];

    const bp = parseBirthdayStr(form.birthday);
    if (bp) {
        birthdayPickerValue.value = [String(bp.y), pad2(bp.m), pad2(bp.d)];
    }
    clampBirthdayPicker();

    regionPickerValue.value = resolveRegionCodes(
        form.region.province,
        form.region.city,
        form.region.district
    );
    clampRegionPicker();
});

function buildPayload() {
    const details = (form.injuryDetails || '').trim();
    return {
        realName: form.realName,
        nickname: form.nickname,
        birthday: form.birthday || '',
        phone: form.phone,
        yearsOfPlaying: Number(form.yearsOfPlaying) || 0,
        position: normalizePosition(form.position),
        preferredIntensity: normalizeIntensity(form.preferredIntensity),
        hasInjury: details.length > 0,
        injuryDetails: form.injuryDetails || '',
        region: {
            province: form.region.province || '',
            city: form.region.city || '',
            district: form.region.district || '',
            detail: (form.region.detail || '').trim()
        }
    };
}

async function handleSubmit() {
    if (formRef.value?.validate) {
        const { valid, errors } = await formRef.value.validate();
        if (!valid && errors?.length) {
            uni.showToast({ title: errors[0].message || '请检查表单', icon: 'none' });
            return;
        }
    }

    submitting.value = true;
    try {
        const payload = buildPayload();
        await updateUserInfoApi(payload);
        try {
            const fresh = await getUserInfoApi();
            uni.setStorageSync('userInfo', normalizeUserInfoForStorage(fresh));
        } catch (e) {
            console.error('getUserInfoApi after update', e);
            const prev = readUserInfoFromStorage() || {};
            uni.setStorageSync('userInfo', normalizeUserInfoForStorage({ ...prev, ...payload }));
        }
        uni.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 800);
    } catch (e) {
        console.error('updateUserInfo', e);
    } finally {
        submitting.value = false;
    }
}
</script>

<style lang="scss" scoped>
.update-user-page {
    min-height: 100vh;
    padding: 24rpx 24rpx 48rpx;
    box-sizing: border-box;
    background: #f4f6f8;
}

.footer-actions {
    margin-top: 32rpx;
    padding: 0 8rpx;
}
</style>
