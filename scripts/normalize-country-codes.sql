-- Normalize country codes to standard ISO codes
-- This script fixes duplicate country names by standardizing target_country_code

-- Hong Kong variants → HK
UPDATE investments 
SET target_country_code = 'HK', target_country_name = '香港'
WHERE target_country_name IN ('香港', '中国香港', '香港特别行政区', '中国香港特别行政区')
   OR target_country_name LIKE '%Hong Kong%';

-- United Arab Emirates variants → AE
UPDATE investments
SET target_country_code = 'AE', target_country_name = '阿联酋'
WHERE target_country_name IN ('阿联酋', '阿拉伯联合酋长国');

-- Congo variants → CD (Democratic Republic of the Congo)
UPDATE investments
SET target_country_code = 'CD', target_country_name = '刚果民主共和国'
WHERE target_country_name IN ('刚果民主共和国', '刚果（金）');

-- Multi-country records - keep as is for now, but标准化code
UPDATE investments
SET target_country_code = 'MULTI'
WHERE target_country_name LIKE '%,%' OR target_country_name LIKE '%，%';

-- Verify the changes
SELECT target_country_code, target_country_name, COUNT(*) as count
FROM investments
GROUP BY target_country_code, target_country_name
HAVING COUNT(*) > 1
ORDER BY count DESC;
