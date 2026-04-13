<template>
    <div class="base-field">
        <div class="base-field-input-wrapper">
            <div class="base-field-left">
                <div class="base-field-label">
                    {{ props.label }}
                </div>
                <div class="base-field-input">
                    <input
                        class="field-input"
                        :value="inputValue"
                        :password="isPasswordType"
                        @input="(e) => handleChange(e.detail)"
                        :placeholder="placeholder"
                        placeholder-style="color:#cbcbcb"
                        @blur="handleBlur"
                        @focus="handleFocus"
                    />
                </div>
            </div>
            <div class="base-field-right">
                <div class="clear-icon" v-if="isShowClearIcon" @click.stop="handleClear">
                    <nut-icon name="mask-close" color="#515151" size="16"></nut-icon>
                </div>
                <div class="eye-icon" v-if="props.password" @click.stop="handleTogglePasswordType">
                    <image
                        :src="isPasswordType ? eye : closedEye"
                        style="width: 48rpx; height: 48rpx"
                    />
                </div>
            </div>
            <slot name="button"></slot>
        </div>
    </div>
</template>

<script setup>
    import eye from '@/static/eye-o.png';
    import closedEye from '@/static/closed-eye.png';
    const props = defineProps({
        value: {
            type: String,
            default: ''
        },
        password: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            default: ''
        }
    });
    const emit = defineEmits(['baseInputChange']);
    const inputValue = ref(props.value);
    const isPasswordType = ref(props.password);
    const isShowClearIcon = ref(false);
    const handleChange = (target) => {
        inputValue.value = target.value;
        if (target.value) {
            isShowClearIcon.value = true;
        } else {
            isShowClearIcon.value = false;
        }
        emit('baseInputChange', inputValue.value);
    };
    const handleFocus = () => {
        if (inputValue.value) {
            isShowClearIcon.value = true;
        } else {
            isShowClearIcon.value = false;
        }
    };
    const handleBlur = () => {
        isShowClearIcon.value = false;
    };
    const handleClear = () => {
        console.log('inputValue.value: ', inputValue.value);
        isShowClearIcon.value = false;
        inputValue.value = '';
    };
    const handleTogglePasswordType = () => {
        isPasswordType.value = !isPasswordType.value;
    };
</script>

<style lang="scss" scoped>
    .base-field {
        padding: 0 32rpx;
        .base-field-input-wrapper {
            display: flex;
            height: 88rpx;
            box-sizing: border-box;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1rpx solid #ebedf0;
            .base-field-left {
                display: flex;
                align-items: center;
                gap: 24rpx;
                .base-field-label {
                    color: #666;
                    font-size: 28rpx;
                    width: 174rpx;
                    height: 48rpx;
                    display: flex;
                    align-items: center;
                }
                .base-field-input {
                    .field-input {
                        height: 48rpx;
                        line-height: inherit;
                        color: #666;
                        font-size: 28rpx;
                        padding: 0;
                        box-sizing: border-box;
                        position: relative;
                        resize: none;
                        text-align: left;
                        width: 100%;
                        border: none;
                        outline: none;
                        background: initial;
                    }
                }
            }
            .base-field-right {
                width: 130rpx;
                height: 60rpx;
                position: relative;
                .clear-icon,
                .eye-icon {
                    width: 60rpx;
                    height: 60rpx;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #bbb;
                    font-size: 32rpx;
                    position: absolute;
                    right: 0;
                    top: 0;
                }
                .clear-icon {
                    right: 70rpx;
                }
            }
        }
    }
</style>
