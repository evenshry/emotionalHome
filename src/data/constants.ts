import { Mood } from '@/types';

export const MOODS: Mood[] = [
  { name: '愤怒', emoji: '😡', color: '#E74C3C', nextStep: '/vent' },
  { name: '焦虑', emoji: '😰', color: '#F39C12', nextStep: '/vent' },
  { name: '悲伤', emoji: '😢', color: '#34495E', nextStep: '/guide' },
  { name: '沮丧', emoji: '😞', color: '#8E44AD', nextStep: '/guide' },
  { name: '平静', emoji: '😌', color: '#1ABC9C', nextStep: '/transform' },
  { name: '还好', emoji: '🙂', color: '#6BA3BE', nextStep: '/transform' },
];

export interface GuideQuestion {
  question: string;
  placeholder: string;
  hint: string;
}

export const GUIDE_QUESTIONS: GuideQuestion[] = [
  {
    question: '现在是什么让你感到不舒服？',
    placeholder: '试着描述让你烦恼的事情...',
    hint: '把想法写下来，有助于理清思路',
  },
  {
    question: '这种情况中，有哪些部分是你无法控制的？',
    placeholder: '想想看，有些事情确实超出我们的掌控...',
    hint: '接受无法改变的事，是释放压力的第一步',
  },
  {
    question: '有哪些部分是你 actually 可以影响或改变的？',
    placeholder: '专注于你能做的事情...',
    hint: '把注意力转向可控的事物',
  },
  {
    question: '如果是你最好的朋友遇到同样的情况，你会怎么安慰ta？',
    placeholder: '对自己也要像对朋友一样温柔...',
    hint: '我们往往对自己更苛刻，试着对自己友善一些',
  },
  {
    question: '从现在起，一个小小的积极行动会是什么？',
    placeholder: '哪怕只是深呼吸三次，也是一个好的开始...',
    hint: '行动不必很大，重要的是方向',
  },
];

export interface BreathingStage {
  name: string;
  duration: number;
  instruction: string;
}

export const BREATHING_STAGES: BreathingStage[] = [
  { name: '吸气', duration: 4, instruction: '慢慢吸气... 数到4' },
  { name: '屏息', duration: 7, instruction: '保持呼吸... 数到7' },
  { name: '呼气', duration: 8, instruction: '缓缓呼气... 数到8' },
];

export const ACTIVITY_NAMES = {
  TEXT_VENT: '文字倾倒',
  BALL_VENT: '压力球释放',
  DRAW_VENT: '涂鸦发泄',
  GUIDE: '情绪梳理',
  GRATITUDE: '感恩日记',
  REFRAME: '积极重构',
  BREATHING: '呼吸放松',
  MUSIC: '音乐放松',
  MEDITATION: '身体扫描',
  EMOTIONS: '情绪卡片',
  BREATHING_GAME: '呼吸游戏',
};
