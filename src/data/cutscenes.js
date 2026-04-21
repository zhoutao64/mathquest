// ─── Zone 1: Number Fortress — Dialogue Scripts ─────────────
// Each cutscene is an array of scenes with speaker, emotion, and bilingual text.

export const CUTSCENES = {

  // ═══════════════════════════════════════════════════════════
  // PROLOGUE — plays after pressing "Start Adventure" (first time)
  // ═══════════════════════════════════════════════════════════
  prologue: [
    {
      speaker: 'narrator',
      en: "Once upon a time, there was a place called the Math Kingdom — where every number had a home, every equation told a story, and everything made perfect sense.",
      zh: "\u4ECE\u524D\uFF0C\u6709\u4E00\u4E2A\u5730\u65B9\u53EB\u505A\u6570\u5B66\u738B\u56FD\u2014\u2014\u6BCF\u4E2A\u6570\u5B57\u90FD\u6709\u81EA\u5DF1\u7684\u5BB6\uFF0C\u6BCF\u4E2A\u7B49\u5F0F\u90FD\u8BB2\u8FF0\u7740\u4E00\u4E2A\u6545\u4E8B\uFF0C\u4E00\u5207\u4E95\u7136\u6709\u5E8F\u3002",
    },
    {
      speaker: 'narrator',
      en: "Until one day... Glitch appeared. It fed on confusion and chaos. It shattered the Core Crystal into six pieces and scattered them across the kingdom.",
      zh: "\u76F4\u5230\u6709\u4E00\u5929\u2026\u2026Glitch\u51FA\u73B0\u4E86\u3002\u5B83\u4EE5\u6DF7\u4E71\u548C\u56F0\u60D1\u4E3A\u98DF\u3002\u5B83\u5C06\u6838\u5FC3\u6C34\u6676\u6253\u788E\u6210\u516D\u5757\u788E\u7247\uFF0C\u6563\u843D\u5728\u738B\u56FD\u5404\u5904\u3002",
    },
    {
      speaker: 'narrator',
      en: "Numbers forgot what they meant. Equations fell apart. The six guardians — who once protected each realm — were captured or lost their powers.",
      zh: "\u6570\u5B57\u5FD8\u8BB0\u4E86\u81EA\u5DF1\u7684\u542B\u4E49\u3002\u7B49\u5F0F\u5D29\u574F\u4E86\u3002\u516D\u4F4D\u5B88\u62A4\u8005\u2014\u2014\u66FE\u7ECF\u4FDD\u62A4\u5404\u4E2A\u9886\u57DF\u7684\u4ED6\u4EEC\u2014\u2014\u88AB\u4FD8\u864F\u6216\u5931\u53BB\u4E86\u529B\u91CF\u3002",
    },
    {
      speaker: 'professor', emotion: 'serious',
      en: "That's where you come in. I'm Professor Pi, and I've been searching for someone brave enough to help.",
      zh: "\u8FD9\u5C31\u662F\u4F60\u767B\u573A\u7684\u65F6\u5019\u4E86\u3002\u6211\u662F\u03C0\u6559\u6388\uFF0C\u6211\u4E00\u76F4\u5728\u5BFB\u627E\u8DB3\u591F\u52C7\u6562\u7684\u4EBA\u6765\u5E2E\u5FD9\u3002",
    },
    {
      speaker: 'professor', emotion: 'encouraging',
      en: "We need to recover all six crystal shards, rescue the guardians, and restore the kingdom. It won't be easy... but I have a feeling about you.",
      zh: "\u6211\u4EEC\u9700\u8981\u627E\u56DE\u5168\u90E8\u516D\u5757\u6C34\u6676\u788E\u7247\uFF0C\u62EF\u6551\u5B88\u62A4\u8005\uFF0C\u6062\u590D\u738B\u56FD\u3002\u8FD9\u4E0D\u4F1A\u5BB9\u6613\u2026\u2026\u4F46\u6211\u5BF9\u4F60\u6709\u79CD\u9884\u611F\u3002",
    },
    {
      speaker: 'professor', emotion: 'happy',
      en: "But first — tell me, who are you?",
      zh: "\u4F46\u9996\u5148\u2014\u2014\u544A\u8BC9\u6211\uFF0C\u4F60\u662F\u8C01\uFF1F",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // ZONE 1 INTRO — first time entering the zone map
  // ═══════════════════════════════════════════════════════════
  zone1_intro: [
    {
      speaker: 'professor', emotion: 'serious',
      en: "This is the Number Fortress. It used to be the busiest place in Math Kingdom... but look at it now.",
      zh: "\u8FD9\u91CC\u662F\u6570\u5B57\u5821\u5792\u3002\u5B83\u66FE\u662F\u6570\u5B66\u738B\u56FD\u6700\u7E41\u534E\u7684\u5730\u65B9\u2026\u2026\u4F46\u4F60\u770B\u770B\u73B0\u5728\u3002",
    },
    {
      speaker: 'narrator',
      en: "The numbers on the walls flicker and twist. Glitch's corrupted code is everywhere.",
      zh: "\u57CE\u5899\u4E0A\u7684\u6570\u5B57\u95EA\u70C1\u626D\u66F2\uFF0C\u5230\u5904\u662F Glitch \u7559\u4E0B\u7684\u4E71\u7801\u3002",
    },
    {
      speaker: 'digit', emotion: 'confused',
      en: "Who are you? Who am I? Where is this?",
      zh: "\u4F60\u662F\u8C01\uFF1F\u6211\u662F\u8C01\uFF1F\u8FD9\u662F\u54EA\u91CC\uFF1F",
    },
    {
      speaker: 'professor', emotion: 'surprised',
      en: "Digit! You're alive! But... Glitch stole your memories?",
      zh: "Digit\uFF01\u4F60\u8FD8\u6D3B\u7740\uFF01\u4F46\u2026\u2026Glitch\u5077\u8D70\u4E86\u4F60\u7684\u8BB0\u5FC6\uFF1F",
    },
    {
      speaker: 'digit', emotion: 'confused',
      en: "Memories? Numbers? Can you eat those?",
      zh: "\u8BB0\u5FC6\uFF1F\u6570\u5B57\uFF1F\u80FD\u5403\u5417\uFF1F",
    },
    {
      speaker: 'professor', emotion: 'determined',
      en: "We'll help you remember, one level at a time. Every room we fix, you'll get a piece back. Let's go!",
      zh: "\u6211\u4EEC\u5F97\u5E2E\u4ED6\u4E00\u5173\u4E00\u5173\u627E\u56DE\u8BB0\u5FC6\u3002\u6BCF\u4FEE\u590D\u4E00\u5904\uFF0C\u4ED6\u5C31\u80FD\u60F3\u8D77\u4E00\u70B9\u3002\u8D70\u5427\uFF01",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // LEVEL 1: Fraction Feast
  // ═══════════════════════════════════════════════════════════
  zone1_level1_intro: [
    {
      speaker: 'narrator',
      en: "The fortress great hall. A cake shop is in complete chaos.",
      zh: "\u5821\u5792\u5927\u5385\uFF0C\u4E00\u5BB6\u86CB\u7CD5\u5E97\u4E71\u6210\u4E00\u56E2\u3002",
    },
    {
      speaker: 'baker', emotion: 'crying',
      en: "A customer ordered half a cake, but I forgot what 'half' means! Glitch scrambled everything!",
      zh: "\u5BA2\u4EBA\u70B9\u4E86\u534A\u4E2A\u86CB\u7CD5\uFF0C\u4F46\u6211\u4E0D\u77E5\u9053\u201C\u534A\u4E2A\u201D\u662F\u4EC0\u4E48\u610F\u601D\u4E86\uFF01Glitch\u628A\u6982\u5FF5\u641E\u4E71\u4E86\uFF01",
    },
    {
      speaker: 'bug', emotion: 'smug',
      en: "Hehe! I ate the words 'equal parts'! No equal parts means no cutting cake!",
      zh: "\u563F\u563F\uFF01\u6211\u628A\u201C\u7B49\u5206\u201D\u4E24\u4E2A\u5B57\u5403\u6389\u4E86\uFF01\u6CA1\u6709\u7B49\u5206\u5C31\u5207\u4E0D\u4E86\u86CB\u7CD5\uFF01",
    },
    {
      speaker: 'professor', emotion: 'encouraging',
      en: "Don't worry. Let our adventurer show you how it's done.",
      zh: "\u522B\u62C5\u5FC3\uFF0C\u8BA9\u6211\u4EEC\u7684\u5192\u9669\u5BB6\u6765\u5207\u7ED9\u4F60\u770B\u3002",
    },
  ],

  zone1_level1_outro: [
    {
      speaker: 'digit', emotion: 'amazed',
      en: "I... I remember! 1/2! The denominator is the total pieces! I used to know this!",
      zh: "\u6211\u2026\u2026\u6211\u60F3\u8D77\u6765\u4E86\uFF011/2\uFF01\u5206\u6BCD\u662F\u603B\u4EFD\u6570\uFF01\u6211\u4EE5\u524D\u77E5\u9053\u8FD9\u4E2A\uFF01",
    },
    {
      speaker: 'bug', emotion: 'panicked',
      en: "No no no! You're not allowed to remember!",
      zh: "\u4E0D\u4E0D\u4E0D\uFF01\u4F60\u4E0D\u8BB8\u60F3\u8D77\u6765\uFF01",
    },
    {
      speaker: 'narrator',
      en: "A cake falls from above and lands squarely on Bug's head.",
      zh: "\u4E00\u5757\u86CB\u7CD5\u4ECE\u5929\u800C\u964D\uFF0C\u6B63\u597D\u7838\u4E2D Bug\u4ED4\u7684\u5934\u3002",
    },
    {
      speaker: 'professor', emotion: 'satisfied',
      en: "One memory restored. Nine more to go. Onward!",
      zh: "\u4E00\u6BB5\u8BB0\u5FC6\u56DE\u6765\u4E86\u3002\u8FD8\u6709\u4E5D\u6BB5\uFF0C\u7EE7\u7EED\u8D70\u5427\u3002",
    },
    {
      speaker: 'digit', emotion: 'smug',
      en: "Wait... did I look cool just now?",
      zh: "\u7B49\u7B49\uFF0C\u6211\u521A\u624D\u662F\u4E0D\u662F\u770B\u8D77\u6765\u5F88\u5E05\uFF1F",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // LEVEL 2: Fraction Frenzy
  // ═══════════════════════════════════════════════════════════
  zone1_level2_intro: [
    {
      speaker: 'narrator',
      en: "The fortress library. Books of equivalent fractions have been ripped apart.",
      zh: "\u5821\u5792\u56FE\u4E66\u9986\u91CC\uFF0C\u7B49\u4EF7\u5206\u6570\u7684\u914D\u5BF9\u4E66\u88AB\u6495\u6563\u4E86\u3002",
    },
    {
      speaker: 'digit', emotion: 'curious',
      en: "This library... I used to come here a lot. But why do 1/2 and 2/4 go together?",
      zh: "\u8FD9\u4E2A\u56FE\u4E66\u9986\u2026\u2026\u6211\u597D\u50CF\u7ECF\u5E38\u6765\u3002\u4F46\u4E3A\u4EC0\u4E48 1/2 \u548C 2/4 \u8981\u653E\u5728\u4E00\u8D77\uFF1F",
    },
    {
      speaker: 'bug', emotion: 'smug',
      en: "Enough talk! I split them apart and you'll NEVER match them again!",
      zh: "\u5E9F\u8BDD\u5C11\u8BF4\uFF01\u6211\u628A\u5B83\u4EEC\u62C6\u6563\u4E86\uFF0C\u4F60\u4EEC\u6C38\u8FDC\u914D\u4E0D\u56DE\u6765\uFF01",
    },
    {
      speaker: 'digit', emotion: 'sassy',
      en: "Why does this villain always announce what he did beforehand?",
      zh: "\u4E3A\u4EC0\u4E48\u8FD9\u4E2A\u574F\u4EBA\u6BCF\u6B21\u90FD\u8981\u63D0\u524D\u544A\u8BC9\u6211\u4EEC\u4ED6\u5E72\u4E86\u4EC0\u4E48\uFF1F",
    },
    {
      speaker: 'bug', emotion: 'flustered',
      en: "B-because that's the rules! Villains need dramatic flair!",
      zh: "\u56E0\u3001\u56E0\u4E3A\u8FD9\u662F\u89C4\u77E9\uFF01\u53CD\u6D3E\u8981\u6709\u4EEA\u5F0F\u611F\uFF01",
    },
  ],

  zone1_level2_outro: [
    {
      speaker: 'digit', emotion: 'excited',
      en: "2/4 IS 1/2! Divide top and bottom by the same number! I used to organize these books every day!",
      zh: "2/4 \u5C31\u662F 1/2\uFF01\u4E0A\u4E0B\u540C\u65F6\u9664\u4EE5 2\uFF01\u6211\u4EE5\u524D\u5929\u5929\u6574\u7406\u8FD9\u4E9B\u4E66\uFF01",
    },
    {
      speaker: 'digit', emotion: 'smug',
      en: "And I remember THIS guy came to cause trouble last time too. I kicked him out in three seconds.",
      zh: "\u800C\u4E14\u6211\u8FD8\u8BB0\u5F97\u8FD9\u4E2A\u5BB6\u4F19\u4E0A\u6B21\u4E5F\u6765\u6363\u4E71\uFF0C\u88AB\u6211\u4E09\u79D2\u949F\u8D76\u8D70\u4E86\u3002",
    },
    {
      speaker: 'bug', emotion: 'distant',
      en: "Th-that was because I hadn't eaten breakfast!",
      zh: "\u90A3\u3001\u90A3\u662F\u56E0\u4E3A\u6211\u5F53\u65F6\u6CA1\u5403\u65E9\u996D\uFF01",
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // LEVEL 3: Decimal Dash
  // ═══════════════════════════════════════════════════════════
  zone1_level3_intro: [
    {
      speaker: 'narrator',
      en: "The fortress training grounds. Number labels on the number line track have been scrambled.",
      zh: "\u5821\u5792\u8BAD\u7EC3\u573A\uFF0C\u6570\u8F74\u8DD1\u9053\u4E0A\u7684\u6570\u5B57\u6807\u7B7E\u5168\u88AB\u6253\u4E71\u4E86\u3002",
    },
    {
      speaker: 'digit', emotion: 'thoughtful',
      en: "This track... I ran here every morning? Is 0.5 in the middle of 0 and 1?",
      zh: "\u8FD9\u6761\u8DD1\u9053\u2026\u2026\u6211\u6BCF\u5929\u65E9\u4E0A\u5728\u8FD9\u91CC\u8DD1\u6B65\uFF1F0.5\u5728 0 \u548C 1 \u4E2D\u95F4\u5BF9\u5417\uFF1F",
    },
    {
      speaker: 'professor', emotion: 'proud',
      en: "You're starting to remember on your own!",
      zh: "\u4F60\u5F00\u59CB\u81EA\u5DF1\u60F3\u8D77\u6765\u4E86\uFF01",
    },
    {
      speaker: 'bug', emotion: 'smug',
      en: "Wrong! 0.5 is over HERE! Trust me!",
      zh: "\u4E0D\u5BF9\uFF010.5\u5728\u8FD9\u91CC\uFF01\u76F8\u4FE1\u6211\uFF01",
    },
    {
      speaker: 'digit', emotion: 'sassy',
      en: "You're a villain and you want me to trust you?",
      zh: "\u4F60\u4E00\u4E2A\u574F\u4EBA\u8BA9\u6211\u76F8\u4FE1\u4F60\uFF1F",
    },
  ],

  zone1_level3_outro: [
    {
      speaker: 'digit', emotion: 'happy',
      en: "Decimals are neighbors living between whole numbers! I remember everything about them!",
      zh: "\u5C0F\u6570\u5C31\u662F\u4F4F\u5728\u6574\u6570\u4E4B\u95F4\u7684\u90BB\u5C45\uFF01\u6211\u5168\u60F3\u8D77\u6765\u4E86\uFF01",
    },
    {
      speaker: 'digit', emotion: 'serious',
      en: "And... I remember something else. Number Golem isn't a bad guy. He's my friend.",
      zh: "\u800C\u4E14\u2026\u2026\u6211\u60F3\u8D77\u6765\u4E00\u4EF6\u4E8B\u3002Number Golem\u4E0D\u662F\u574F\u4EBA\u3002\u4ED6\u662F\u6211\u7684\u670B\u53CB\u3002",
    },
    {
      speaker: 'professor', emotion: 'surprised',
      en: "What?",
      zh: "\u4EC0\u4E48\uFF1F",
    },
    {
      speaker: 'digit', emotion: 'determined',
      en: "Glitch is controlling him. We have to save him.",
      zh: "Glitch\u63A7\u5236\u4E86\u4ED6\u3002\u6211\u4EEC\u5F97\u6551\u4ED6\u3002",
    },
  ],

  // ── Zone 1 Level 4: Negative Plunge ─────────────────────────
  zone1_level4_intro: [
    {
      speaker: 'narrator',
      en: "Deep beneath the fortress, the team discovers a vast underground lake. Numbers float in the air above... and glow beneath the dark water.",
      zh: "在堡垒深处，团队发现了一个巨大的地下湖。数字漂浮在空中……也在幽暗的水下发光。",
    },
    {
      speaker: 'digit', emotion: 'confused',
      en: "Wait — those numbers have a minus sign? -1, -2, -3? What does that even mean?",
      zh: "等等——那些数字前面有个减号？-1、-2、-3？这是什么意思？",
    },
    {
      speaker: 'professor', emotion: 'encouraging',
      en: "Those are negative numbers! The water surface is zero. Above is positive, below is negative. The deeper you go, the smaller the number!",
      zh: "那些是负数！水面就是零。水上是正数，水下是负数。潜得越深，数字越小！",
    },
    {
      speaker: 'bug', emotion: 'smug',
      en: "Hah! I sank those numbers on purpose! Good luck finding them in the deep!",
      zh: "哈！那些数字是我故意沉下去的！有本事到深处去找！",
    },
    {
      speaker: 'digit', emotion: 'determined',
      en: "A submarine! If I can figure out the depth controls, I can rescue them!",
      zh: "一艘潜水艇！如果我能搞懂深度控制，就能把它们救出来！",
    },
  ],

  zone1_level4_outro: [
    {
      speaker: 'digit', emotion: 'amazed',
      en: "I get it now! Negative numbers are just the other side of zero — like underground floors in a building!",
      zh: "我明白了！负数就是零的另一边——就像大楼的地下楼层！",
    },
    {
      speaker: 'digit', emotion: 'excited',
      en: "And going deeper means getting MORE negative — -5 is deeper than -2! It's like counting backwards past zero!",
      zh: "而且越深就越负——-5比-2更深！就像从零开始倒着数！",
    },
    {
      speaker: 'professor', emotion: 'happy',
      en: "Excellent! You've discovered the entire number line — positive AND negative. That's a big piece of your memory back!",
      zh: "太棒了！你发现了完整的数轴——正数和负数。又找回一大段记忆！",
    },
    {
      speaker: 'bug', emotion: 'panicked',
      en: "Impossible! Nobody figures out negative numbers that fast!",
      zh: "不可能！没人能这么快搞懂负数！",
    },
    {
      speaker: 'digit', emotion: 'sassy',
      en: "Apparently, I'm not just nobody.",
      zh: "很明显，我不是一般人。",
    },
  ],

  // ── Zone 1 Level 5: Absolute Adventure ─────────────────────
  zone1_level5_intro: [
    {
      speaker: 'narrator',
      en: "The team reaches a crossroads. A weathered signpost reads: HOME = 0. Paths stretch in both directions as far as the eye can see.",
      zh: "团队来到一个十字路口。一块风化的路标写着：HOME = 0。道路向两个方向无限延伸。",
    },
    {
      speaker: 'digit', emotion: 'confused',
      en: "HOME = 0? So this spot is 'home'... and numbers spread out in both directions?",
      zh: "HOME = 0？所以这个地方就是「家」……数字向两边展开？",
    },
    {
      speaker: 'bug', emotion: 'smug',
      en: "Ha! -3 is obviously closer than 4 — it's a smaller number! Negative means less, duh!",
      zh: "哈！-3 明显比 4 近——它是更小的数字嘛！负数就是更少，这还用说？",
    },
    {
      speaker: 'professor', emotion: 'encouraging',
      en: "Hmm, is that really true? Let's measure the actual distances and find out. The distance from home is called the absolute value!",
      zh: "嗯，真的是这样吗？让我们量一量实际距离。从家出发的距离叫做绝对值！",
    },
    {
      speaker: 'digit', emotion: 'determined',
      en: "I'll walk the path and count my steps. Distance can't lie!",
      zh: "我走过去数步数就知道了。距离不会骗人的！",
    },
  ],

  zone1_level5_outro: [
    {
      speaker: 'digit', emotion: 'amazed',
      en: "Distance from home doesn't care about direction — only steps count! |-5| = 5 because it's 5 steps away!",
      zh: "离家的距离不管方向——只看步数！|-5| = 5 因为走了5步！",
    },
    {
      speaker: 'digit', emotion: 'excited',
      en: "And |5| = 5 too! Both 5 and -5 are the same distance from home — just in opposite directions!",
      zh: "而且 |5| 也等于 5！5 和 -5 离家一样远——只是方向相反！",
    },
    {
      speaker: 'bug', emotion: 'flustered',
      en: "But... but negative means less! My whole argument falls apart!",
      zh: "但是……但是负数就是更少啊！我的论点全崩了！",
    },
    {
      speaker: 'professor', emotion: 'happy',
      en: "Absolute value strips away direction and gives pure distance. A powerful concept!",
      zh: "绝对值去掉方向，给出纯粹的距离。这是一个强大的概念！",
    },
    {
      speaker: 'digit', emotion: 'sassy',
      en: "Bug, maybe you should measure how far YOU are from being a good villain!",
      zh: "Bug仔，要不你量量自己离一个好反派有多远？",
    },
  ],
}

// Helper: get cutscene by ID
export function getCutscene(id) {
  return CUTSCENES[id] || null
}
