<template>
    <div class="update-user-page">
        <nut-form ref="formRef" :model-value="form">
            <nut-form-item label="真实姓名" prop="realName">
                <nut-input v-model="form.realName" placeholder="请输入真实姓名" />
            </nut-form-item>
            <nut-form-item label="绰号" prop="nickname">
                <nut-input v-model="form.nickname" placeholder="场上或队友对你的称呼" />
            </nut-form-item>
            <nut-form-item label="年龄" prop="age" :rules="[
                { required: true, message: '请填写年龄' },
                { validator: ageNumberValidator, message: '必须输入数字' },
                { validator: ageRangeValidator, message: '必须输入0-80区间' },
            ]">
                <nut-input v-model="form.age" placeholder="请输入年龄" />
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
            <nut-form-item label="所在地区">
                <nut-input v-model="form.region.province" placeholder="省" />
                <nut-input v-model="form.region.city" class="region-row" placeholder="市" />
                <nut-input v-model="form.region.district" class="region-row" placeholder="区/县" />
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
    </div>
</template>

<script setup>
import { updateUserInfoApi } from '@/api/user';
import { computed } from 'vue';

const formRef = ref(null);
const submitting = ref(false);
const yearsVisible = ref(false);
const positionVisible = ref(false);
const intensityVisible = ref(false);

const form = reactive({
    realName: '',
    nickname: '',
    age: '',
    phone: '',
    yearsOfPlaying: 0,
    position: 'UNKNOWN',
    preferredIntensity: 'UNKNOWN',
    region: {
        province: '',
        city: '',
        district: ''
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

const yearsDisplayText = computed(() => {
    const y = Number(form.yearsOfPlaying) || 0;
    if (y <= 0) return '未设置（0 年）';
    return `${y} 年`;
});

function ageNumberValidator(value) {
    return /^\d+$/.test(value);
}

function ageRangeValidator(value) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 80;
}

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

function applyUserProfile(src) {
    if (!src || typeof src !== 'object') return;

    if (src.realName !== undefined && src.realName !== null) form.realName = String(src.realName);
    if (src.nickname !== undefined && src.nickname !== null) form.nickname = String(src.nickname);

    form.phone = src.phone;

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

onMounted(() => {
    const cached = readUserInfoFromStorage();
    if (!cached) {
        uni.reLaunch({ url: '/pages/login/index' });
        return;
    }

    applyUserProfile(cached);

    yearsPickerValue.value = [String(form.yearsOfPlaying)];
    positionPickerValue.value = positionPickerValueFromForm();
    intensityPickerValue.value = [normalizeIntensity(form.preferredIntensity)];
});

function buildPayload() {
    const details = (form.injuryDetails || '').trim();
    return {
        realName: form.realName,
        nickname: form.nickname,
        phone: form.phone,
        yearsOfPlaying: Number(form.yearsOfPlaying) || 0,
        position: normalizePosition(form.position),
        preferredIntensity: normalizeIntensity(form.preferredIntensity),
        hasInjury: details.length > 0,
        injuryDetails: form.injuryDetails || '',
        region: {
            province: form.region.province || '',
            city: form.region.city || '',
            district: form.region.district || ''
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
        const prev = readUserInfoFromStorage() || {};
        uni.setStorageSync('userInfo', {
            ...prev,
            ...payload
        });
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

.region-row {
    margin-top: 16rpx;
}

.footer-actions {
    margin-top: 32rpx;
    padding: 0 8rpx;
}
</style>
