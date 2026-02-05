/**
 * Supabase 连接测试脚本
 * 运行: node scripts/test-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 Supabase 配置检查...\n');

// 检查环境变量
if (!supabaseUrl || supabaseUrl === 'https://xxxxx.supabase.co') {
  console.error('❌ PUBLIC_SUPABASE_URL 未配置');
  console.log('   请在 .env 文件中设置正确的 Supabase URL\n');
  process.exit(1);
}

if (!supabaseKey || supabaseKey.startsWith('eyJhbG...')) {
  console.error('❌ PUBLIC_SUPABASE_ANON_KEY 未配置');
  console.log('   请在 .env 文件中设置正确的 Supabase Anon Key\n');
  process.exit(1);
}

console.log('✅ 环境变量已配置');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📡 测试数据库连接...\n');

// 测试表是否存在
const requiredTables = [
  'carts',
  'addresses',
  'orders',
  'order_items',
  'payments',
  'order_events',
  'reviews',
  'admin_users',
  'coupons'
];

let allTablesExist = true;

for (const table of requiredTables) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error(`❌ 表 "${table}" 不存在或无法访问`);
      console.error(`   错误: ${error.message}`);
      allTablesExist = false;
    } else {
      console.log(`✅ 表 "${table}" 存在`);
    }
  } catch (err) {
    console.error(`❌ 检查表 "${table}" 时出错: ${err.message}`);
    allTablesExist = false;
  }
}

console.log('\n' + '='.repeat(50) + '\n');

if (allTablesExist) {
  console.log('🎉 Supabase 配置成功!');
  console.log('   所有必需的数据库表都已创建\n');
  console.log('📝 下一步:');
  console.log('   - Task-0.3: 配置 Tailwind 品牌色');
  console.log('   - Task-0.4: 配置 site-settings.ts\n');
} else {
  console.log('⚠️  Supabase 配置不完整');
  console.log('   请按照 SETUP-SUPABASE.md 指南运行数据库 Schema\n');
  console.log('📖 参考文档:');
  console.log('   - SETUP-SUPABASE.md');
  console.log('   - supabase-schema.sql\n');
  process.exit(1);
}
