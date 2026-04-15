<template>
    <div class="create-team-page">
        <!-- 队徽上传区 -->
        <div class="logo-section">
            <div class="logo-wrap" @click="chooseLogo">
                <image v-if="form.logoUrl" :src="form.logoUrl" class="logo-img" mode="aspectFill" />
                <div v-else class="logo-placeholder">
                    <text class="logo-icon">🏀</text>
                    <text class="logo-hint">点击上传队徽</text>
                </div>
                <div class="logo-badge">
                    <text>📷</text>
                </div>
            </div>
            <text class="logo-tip">支持 JPG / PNG，建议正方形图片</text>
        </div>

        <!-- 基本信息 -->
        <nut-form ref="formRef" :model-value="form">
            <div class="section-title">基本信息</div>
            <nut-form-item label="队名" prop="name" :rules="[
                { required: true, message: '请输入队名' },
                { max: 30, message: '队名不能超过30字' },
            ]">
                <nut-input v-model="form.name" placeholder="请输入队名（最多30字）" :maxlength="30" />
                <template #right>
                    <text class="char-count">{{ form.name.length }}/30</text>
                </template>
            </nut-form-item>

            <nut-form-item label="队伍简介" prop="description">
                <nut-textarea v-model="form.description" placeholder="介绍一下你们球队（最多200字）" :max-length="200" limit-show
                    :rows="3" />
            </nut-form-item>

            <nut-form-item label="比赛强度" prop="preferredIntensity" is-link>
                <nut-input :model-value="intensityDisplayText" placeholder="请选择偏好强度" readonly
                    @click="openIntensityPicker" />
            </nut-form-item>

            <!-- 强度选择弹层 -->
            <nut-popup v-model:visible="intensityVisible" position="bottom" safe-area-inset-bottom>
                <nut-picker v-model="intensityPickerValue" :columns="intensityColumns" title="选择比赛强度偏好"
                    @confirm="onIntensityConfirm" @cancel="intensityVisible = false" />
            </nut-popup>

            <!-- 所在地区 -->
            <div class="section-title">所在地区</div>

            <nut-form-item label="省市区" is-link>
                <nut-input :model-value="regionDisplayText" placeholder="请选择省市区" readonly @click="openRegionPicker" />
            </nut-form-item>

            <nut-popup v-model:visible="regionVisible" position="bottom" safe-area-inset-bottom>
                <nut-picker v-model="regionPickerValue" :columns="regionColumns" title="选择所在地区"
                    @confirm="onRegionConfirm" @cancel="regionVisible = false" />
            </nut-popup>
        </nut-form>

        <!-- 提交按钮 -->
        <div class="footer-actions">
            <nut-button type="primary" block :loading="submitting" @click="handleSubmit">
                创建球队
            </nut-button>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
// 替换为你项目实际的 API 和地区数据
// import { createTeamApi } from '@/api/team';
import { getRegionNamesByCodes, resolveRegionCodes, sichuanRegion } from '@/utils/regionData';

// ─────────────────────────────────────────────────────────

const formRef = ref(null);
const submitting = ref(false);

const form = reactive({
    name: '',
    logoUrl: '',
    description: '',
    preferredIntensity: '',
    region: {
        province: '',
        city: '',
        district: '',
    },
});

// ─── 强度 Picker ─────────────────────────────────────────
const intensityVisible = ref(false);
const intensityPickerValue = ref(['']);
const intensityColumns = [
    { text: '不限', value: 'ANY' },
    { text: '养生局（轻松休闲）', value: 'CASUAL' },
    { text: '强度局（正常对抗）', value: 'MODERATE' },
    { text: '专业局（高强度竞技）', value: 'COMPETITIVE' },
];

const intensityDisplayText = computed(() => {
    const hit = intensityColumns.find(c => c.value === form.preferredIntensity);
    return hit ? hit.text : '';
});

function openIntensityPicker() {
    intensityPickerValue.value = [form.preferredIntensity || '不限'];
    intensityVisible.value = true;
}

function onIntensityConfirm({ selectedOptions }) {
    const opt = selectedOptions?.[0];
    if (opt) form.preferredIntensity = opt.value;
    intensityVisible.value = false;
}

// ─── 地区 Picker ─────────────────────────────────────────
const regionVisible = ref(false);
const regionPickerValue = ref(['510000', '510100', '510104']);

const regionColumns = computed(() => {
    const [pCode, cCode] = regionPickerValue.value;
    const p = sichuanRegion.find(x => x.code === pCode) || sichuanRegion[0];
    const cities = (p?.children || []).map(n => ({ text: n.name, value: n.code }));
    const cityNode = (p?.children || []).find(x => x.code === cCode) || p?.children?.[0];
    const districts = (cityNode?.children || []).map(n => ({ text: n.name, value: n.code }));
    return [
        sichuanRegion.map(n => ({ text: n.name, value: n.code })),
        cities,
        districts,
    ];
});

function clampRegionPicker() {
    const provs = sichuanRegion.map(x => x.code);
    let pCode = regionPickerValue.value[0];
    if (!provs.includes(pCode)) pCode = provs[0];
    const p = sichuanRegion.find(x => x.code === pCode) || sichuanRegion[0];
    const cities = (p?.children || []).map(x => x.code);
    let cCode = regionPickerValue.value[1];
    if (!cities.includes(cCode)) cCode = cities[0];
    const cityNode = (p?.children || []).find(x => x.code === cCode);
    const districts = (cityNode?.children || []).map(x => x.code);
    let dCode = regionPickerValue.value[2];
    if (!districts.includes(dCode)) dCode = districts[0];
    const next = [pCode, cCode, dCode];
    const cur = regionPickerValue.value;
    if (cur[0] !== next[0] || cur[1] !== next[1] || cur[2] !== next[2]) {
        regionPickerValue.value = next;
    }
}

watch(regionPickerValue, () => clampRegionPicker(), { deep: true });

const regionDisplayText = computed(() => {
    const { province, city, district } = form.region;
    return [province, city, district].filter(Boolean).join(' ');
});

function openRegionPicker() {
    regionPickerValue.value = resolveRegionCodes(
        form.region.province, form.region.city, form.region.district
    );
    clampRegionPicker();
    regionVisible.value = true;
}

function onRegionConfirm({ selectedValue }) {
    clampRegionPicker();
    const sv = selectedValue?.length >= 3 ? selectedValue : regionPickerValue.value;
    const names = getRegionNamesByCodes(String(sv[0]), String(sv[1]), String(sv[2]));
    form.region.province = names.province;
    form.region.city = names.city;
    form.region.district = names.district;
    regionPickerValue.value = [String(sv[0]), String(sv[1]), String(sv[2])];
    regionVisible.value = false;
}

// ─── 队徽上传 ─────────────────────────────────────────────
function chooseLogo() {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            uploadLogo(res.tempFilePaths[0]);
        },
    });
}

function uploadLogo(filePath) {
    uni.showLoading({ title: '上传中...' });
    uni.uploadFile({
        url: 'https://your-api.com/upload', // ← 替换为实际地址
        filePath,
        name: 'file',
        header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
        success: (res) => {
            try {
                const data = JSON.parse(res.data);
                form.logoUrl = data.url;
            } catch {
                uni.showToast({ title: '上传失败，请重试', icon: 'none' });
            }
        },
        fail: () => uni.showToast({ title: '上传失败，请重试', icon: 'none' }),
        complete: () => uni.hideLoading(),
    });
}

// ─── 提交 ─────────────────────────────────────────────────
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
        const payload = {
            name: form.name.trim(),
            logoUrl: form.logoUrl,
            description: form.description.trim(),
            preferredIntensity: form.preferredIntensity || '不限',
            region: { ...form.region },
        };

        // await createTeamApi(payload);
        console.log('创建球队 payload:', payload); // 调试用，联调时替换为上方真实接口

        uni.showToast({ title: '创建成功！', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 800);
    } catch (e) {
        console.error('createTeam', e);
        uni.showToast({ title: e?.message || '创建失败，请重试', icon: 'none' });
    } finally {
        submitting.value = false;
    }
}
</script>

<style lang="scss" scoped>
.create-team-page {
    min-height: 100vh;
    padding: 24rpx 24rpx 80rpx;
    box-sizing: border-box;
    background: #f4f6f8;
}

// 队徽上传
.logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0 32rpx;
}

.logo-wrap {
    position: relative;
    width: 160rpx;
    height: 160rpx;
    border-radius: 24rpx;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-img {
    width: 100%;
    height: 100%;
}

.logo-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
}

.logo-icon {
    font-size: 56rpx;
}

.logo-hint {
    font-size: 20rpx;
    color: #999;
}

.logo-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 48rpx;
    height: 48rpx;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
}

.logo-tip {
    margin-top: 16rpx;
    font-size: 22rpx;
    color: #aaa;
}

// 分组标题
.section-title {
    font-size: 26rpx;
    font-weight: 600;
    color: #666;
    padding: 28rpx 16rpx 8rpx;
    letter-spacing: 0.5px;
}

// 字数统计
.char-count {
    font-size: 22rpx;
    color: #bbb;
    white-space: nowrap;
}

// 底部按钮
.footer-actions {
    margin-top: 48rpx;
    padding: 0 8rpx;
}
</style>
