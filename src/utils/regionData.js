export const sichuanRegion = [
    {
        code: '510000',
        name: '四川省',
        children: [
            {
                code: '510100',
                name: '成都市',
                children: [
                    { code: '510104', name: '锦江区' },
                    { code: '510105', name: '青羊区' },
                    { code: '510106', name: '金牛区' },
                    { code: '510107', name: '武侯区' },
                    { code: '510108', name: '成华区' },
                    { code: '510112', name: '龙泉驿区' },
                    { code: '510113', name: '青白江区' },
                    { code: '510114', name: '新都区' },
                    { code: '510115', name: '温江区' },
                    { code: '510116', name: '双流区' },
                    { code: '510117', name: '郫都区' },
                    { code: '510118', name: '新津区' },
                    { code: '510154', name: '金堂县' },
                    { code: '510156', name: '大邑县' },
                    { code: '510157', name: '蒲江县' },
                    { code: '510181', name: '都江堰市' },
                    { code: '510182', name: '彭州市' },
                    { code: '510183', name: '邛崃市' },
                    { code: '510184', name: '崇州市' },
                    { code: '510185', name: '简阳市' }
                ]
            },
            {
                code: '510700',
                name: '绵阳市',
                children: [
                    { code: '510703', name: '涪城区' },
                    { code: '510704', name: '游仙区' },
                    { code: '510705', name: '安州区' },
                    { code: '510722', name: '三台县' },
                    { code: '510723', name: '盐亭县' },
                    { code: '510725', name: '梓潼县' },
                    { code: '510726', name: '北川羌族自治县' },
                    { code: '510727', name: '平武县' },
                    { code: '510781', name: '江油市' }
                ]
            }
        ]
    }
];

/** 根据省市区名称解析为行政区划代码（用于 Picker 回显）；仅覆盖成都市、绵阳市 */
export function resolveRegionCodes(province, city, district) {
    const p = sichuanRegion[0];
    if (!p) return ['510000', '510100', '510104'];
    const cities = p.children || [];
    const cityNode = cities.find((c) => c.name === city) || cities[0];
    const districts = cityNode?.children || [];
    const distNode = districts.find((d) => d.name === district) || districts[0];
    return [p.code, cityNode?.code, distNode?.code].filter(Boolean);
}

/** 根据三级 code 取中文名称 */
export function getRegionNamesByCodes(provinceCode, cityCode, districtCode) {
    const p = sichuanRegion.find((x) => x.code === provinceCode);
    const c = p?.children?.find((x) => x.code === cityCode);
    const d = c?.children?.find((x) => x.code === districtCode);
    return {
        province: p?.name || '',
        city: c?.name || '',
        district: d?.name || ''
    };
}
