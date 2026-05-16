/**
 * Prettier 配置文件
 * 
 * 配置代码格式化规则
 */

module.exports = {
  // 单引号
  singleQuote: true,

  // 不使用分号
  semi: false,

  // 尾随逗号
  trailingComma: 'es5',

  // 制表符宽度
  tabWidth: 2,

  // 使用空格缩进
  useTabs: false,

  // 行宽
  printWidth: 100,

  // 换行符
  endOfLine: 'lf',

  // 箭头函数括号
  arrowParens: 'avoid',

  // Tailwind CSS 类名排序
  plugins: ['prettier-plugin-tailwindcss'],
};