import { Quote } from '@/types';

const DAILY_QUOTES: Quote[] = [
  { text: '每一天都是新的开始，你比你想象的更强大。', author: '未知' },
  { text: '微笑是世界上最美丽的曲线。', author: '未知' },
  { text: '生活不是等待暴风雨过去，而是学会在雨中跳舞。', author: '未知' },
  { text: '你已经走了这么远，不要现在放弃。', author: '未知' },
  { text: '每一次呼吸都是一个新的机会。', author: '未知' },
  { text: '你不需要很完美，你只需要很真实。', author: '未知' },
  { text: '感恩你所拥有的，你会有更多。', author: '未知' },
  { text: '快乐不是因为拥有的多，而是因为计较的少。', author: '未知' },
  { text: '今天的你是昨天的你努力的结果，明天的你将是今天你努力的结果。', author: '未知' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
  { text: '生活中最重要的事情，不是身在何处，而是心朝何方。', author: '奥利弗·温德尔·霍姆斯' },
  { text: '你不能左右天气，但你可以改变心情。', author: '未知' },
  { text: '勇敢不是不害怕，而是害怕了还要继续前行。', author: '未知' },
  { text: '你的价值不取决于别人的认可。', author: '未知' },
  { text: '慢慢来，比较快。', author: '未知' },
  { text: '做你害怕做的事情，然后你会发现你不怕了。', author: '未知' },
  { text: '人生没有白走的路，每一步都算数。', author: '李宗盛' },
  { text: '当你觉得为时已晚的时候，恰恰是最早的时候。', author: '未知' },
  { text: '与其抱怨黑暗，不如点亮蜡烛。', author: '未知' },
  { text: '你不必很厉害才能开始，但你必须开始才能变得厉害。', author: '未知' },
];

export function getDailyQuote(): Quote {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

export default DAILY_QUOTES;
