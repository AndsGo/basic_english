// Design preview only. Selected existing story content; no application progress is loaded.
const sampleStories = [
  {
    "id": "give-a-book",
    "sourceId": "story-03-give",
    "title": "A book for my friend",
    "wordId": "give",
    "courseWeek": 3,
    "week": 3,
    "definition": "to let another person have something",
    "definitionChinese": "把某物交给另一个人，使对方持有",
    "reviewWordIds": [
      "book",
      "friend",
      "have",
      "happy"
    ],
    "narrator": "The boy in blue is speaking.",
    "narratorChinese": "蓝衣男孩",
    "contextSupport": [
      {
        "text": "now",
        "definition": "at this time",
        "chinese": "现在，此刻"
      },
      {
        "text": "no",
        "definition": "not any",
        "chinese": "没有；例如 no book 是没有书"
      }
    ],
    "pages": [
      {
        "text": "I have a book. My friend is here.",
        "chinese": "我有一本书。我的朋友在这里。",
        "file": "give-1.webp",
        "alt": "A boy in blue has a green book. His friend is near the table.",
        "semanticText": null
      },
      {
        "text": "My friend has no book.",
        "chinese": "我的朋友没有书。",
        "file": "give-2.webp",
        "alt": "The girl has no book. The boy has a green book.",
        "semanticText": null
      },
      {
        "text": "I give a book to my friend.",
        "chinese": "我把一本书给我的朋友。",
        "file": "give-3.webp",
        "alt": "The boy is giving the green book to the girl.",
        "semanticText": null
      },
      {
        "text": "Now my friend has the book. She is happy.",
        "chinese": "现在我的朋友有了这本书。她很高兴。",
        "file": "give-4.webp",
        "alt": "The girl now has the green book. The boy has no book. They are happy.",
        "semanticText": null
      }
    ],
    "check": {
      "prompt": "I give a pen to my friend. Who has the pen now?",
      "options": [
        "My friend has the pen.",
        "I have the pen."
      ],
      "correctIndex": 0,
      "success": "Correct. My friend has the pen after I give it to her.",
      "retry": "Look again at the question.",
      "chinese": "我把笔给朋友。现在谁有笔？"
    },
    "practice": "I give a ___ to my friend.",
    "practiceExamples": [
      "I give a cup to my friend."
    ],
    "ready": true,
    "titleChinese": "给朋友一本书",
    "phonetic": "/ɡɪv/"
  },
  {
    "id": "under-the-chair",
    "sourceId": "story-02-under",
    "title": "Where is my bag?",
    "wordId": "under",
    "courseWeek": 2,
    "week": 3,
    "definition": "below something",
    "definitionChinese": "在某个物体下方",
    "reviewWordIds": [
      "bag",
      "chair",
      "book",
      "table"
    ],
    "narrator": "The girl in red is speaking.",
    "narratorChinese": "红衣卷发女孩",
    "contextSupport": [],
    "pages": [
      {
        "text": "Where is my bag?",
        "chinese": "我的书包在哪里？",
        "file": "under-1.webp",
        "alt": "A girl is looking for her bag. The bag is below the chair. A book is below the table.",
        "semanticText": null
      },
      {
        "text": "My bag is not on the chair.",
        "chinese": "我的书包不在椅子上。",
        "file": "under-2.webp",
        "alt": "The girl looks at the empty chair seat. Her bag is below the seat.",
        "semanticText": null
      },
      {
        "text": "The bag is under the chair.",
        "chinese": "书包在椅子下面。",
        "file": "under-3.webp",
        "alt": "The girl points to her bag below the chair seat, between the chair legs.",
        "semanticText": null
      },
      {
        "text": "My book is under the table.",
        "chinese": "我的书在桌子下面。",
        "file": "under-4.webp",
        "alt": "The girl points to the book below the table. The bag is still below the chair.",
        "semanticText": null
      }
    ],
    "check": {
      "prompt": "The cup is under the table. Is the cup on the table?",
      "options": [
        "Yes, it is on the table.",
        "No, it is under the table."
      ],
      "correctIndex": 1,
      "success": "Correct. Under means below. The cup is not on top of the table.",
      "retry": "Look again at the question.",
      "chinese": "杯子在桌子下面。它是在桌子上面吗？"
    },
    "practice": "The ___ is under the table.",
    "practiceExamples": [
      "The bag is under the table."
    ],
    "ready": true,
    "titleChinese": "书包在哪里",
    "phonetic": "/ˈʌndə/"
  },
  {
    "id": "open-the-box",
    "sourceId": "companion-open",
    "title": "A book in a box",
    "wordId": "open",
    "courseWeek": 3,
    "week": 3,
    "definition": "to move something so it is not closed",
    "definitionChinese": "打开物体的动作",
    "reviewWordIds": [
      "book",
      "box",
      "have",
      "in"
    ],
    "narrator": "The girl in yellow is speaking.",
    "narratorChinese": "黄衣女孩",
    "contextSupport": [
      {
        "text": "now",
        "definition": "at this time",
        "chinese": "现在，此刻"
      }
    ],
    "pages": [
      {
        "text": "My book is in the box.",
        "chinese": "我的书在盒子里。",
        "file": "open-1.webp",
        "alt": "A girl is at a table with a closed box. Her book is in the box.",
        "semanticText": null
      },
      {
        "text": "I open the box.",
        "chinese": "我打开盒子。",
        "file": "open-2.webp",
        "alt": "The girl lifts the box top. A closed green book is in the box.",
        "semanticText": null
      },
      {
        "text": "I open the book.",
        "chinese": "我打开书。",
        "file": "open-3.webp",
        "alt": "The girl opens the green book on the table. The empty box is near it.",
        "semanticText": null
      },
      {
        "text": "Now I can read my book.",
        "chinese": "现在我能读书了。",
        "file": "open-4.webp",
        "alt": "The girl looks at pictures in her open book. The empty box is near her.",
        "semanticText": null
      }
    ],
    "check": {
      "prompt": "I open a box. Is the box closed now?",
      "options": [
        "Yes.",
        "No."
      ],
      "correctIndex": 1,
      "success": "Correct. The box is open after I open it.",
      "retry": "Look again at the question.",
      "chinese": "打开盒子之后，盒子现在关着吗？"
    },
    "practice": "I open the ___.",
    "practiceExamples": [
      "I open the book."
    ],
    "ready": true,
    "titleChinese": "盒子里有一本书",
    "phonetic": "/ˈəʊpən/"
  },
  {
    "id": "story-01-friend",
    "sourceId": "story-01-friend",
    "title": "My new friend",
    "wordId": "friend",
    "courseWeek": 1,
    "week": 1,
    "definition": "a person you like",
    "definitionChinese": "朋友，彼此愿意相处的人",
    "reviewWordIds": [
      "name",
      "she",
      "kind",
      "study"
    ],
    "narrator": "Li is speaking.",
    "narratorChinese": "Li",
    "contextSupport": [],
    "pages": [
      {
        "text": "My name is Li.",
        "chinese": "我的名字叫 Li。",
        "file": "friend-1.webp",
        "alt": "Li and Anna are in the same room.",
        "semanticText": null
      },
      {
        "text": "This is Anna. She is kind.",
        "chinese": "这是 Anna。她很友好。",
        "file": "friend-2.webp",
        "alt": "Anna makes a place for Li at the table.",
        "semanticText": null
      },
      {
        "text": "Anna is my friend.",
        "chinese": "Anna 是我的朋友。",
        "file": "friend-3.webp",
        "alt": "Li shows a picture to Anna, and Anna shows a picture to Li.",
        "semanticText": null
      },
      {
        "text": "I study English with my friend.",
        "chinese": "我和朋友一起学英语。",
        "file": "friend-4.webp",
        "alt": "Li and Anna read the same book together.",
        "semanticText": null
      }
    ],
    "check": {
      "prompt": "Li and Anna study together. Anna is Li's friend. Who is Li's friend?",
      "options": [
        "Anna.",
        "The table."
      ],
      "correctIndex": 0,
      "success": "Correct. Anna is a person. Li and Anna study together.",
      "retry": "Look again at the question.",
      "chinese": "Li 和 Anna 一起学习。Anna 是 Li 的朋友。谁是 Li 的朋友？"
    },
    "practice": "This is my friend, ___.",
    "practiceExamples": [
      "This is my friend, Anna."
    ],
    "ready": true,
    "titleChinese": "我的新朋友",
    "phonetic": "/frend/"
  },
  {
    "id": "story-04-enough",
    "sourceId": "story-04-enough",
    "title": "Food for a friend and me",
    "wordId": "enough",
    "courseWeek": 4,
    "week": 4,
    "definition": "as much as needed",
    "definitionChinese": "足以满足明确的需要",
    "reviewWordIds": [
      "food",
      "bread",
      "friend",
      "have"
    ],
    "narrator": "The person in green is speaking.",
    "narratorChinese": "左侧就餐者",
    "contextSupport": [
      {
        "text": "now",
        "definition": "at this time",
        "chinese": "现在，此刻"
      }
    ],
    "pages": [
      {
        "text": "My friend and I need some bread.",
        "chinese": "朋友和我需要一些面包。",
        "file": "enough-1.webp",
        "alt": "My friend and I are at a table. There is no bread.",
        "semanticText": null
      },
      {
        "text": "I have bread for me, but not for my friend.",
        "chinese": "我有自己吃的面包，却没有给朋友的。",
        "file": "enough-2.webp",
        "alt": "I have bread. My friend has no bread.",
        "semanticText": null
      },
      {
        "text": "Now I have bread for my friend.",
        "chinese": "现在我也有给朋友的面包了。",
        "file": "enough-3.webp",
        "alt": "I put bread in front of my friend. I have bread for me.",
        "semanticText": null
      },
      {
        "text": "My friend and I have enough bread for this meal.",
        "chinese": "这顿饭我们有足够的面包。",
        "file": "enough-4.webp",
        "alt": "There is bread for my friend and bread for me.",
        "semanticText": null
      }
    ],
    "check": {
      "prompt": "I need a cup for me and a cup for my friend. I have one cup. Do I have enough?",
      "options": [
        "Yes.",
        "No."
      ],
      "correctIndex": 1,
      "success": "Correct. My friend needs a cup, and I need a cup. My friend has no cup.",
      "retry": "Look again at the question.",
      "chinese": "我和朋友各需要一个杯子，但现在只有一个，够吗？"
    },
    "practice": "I have enough ___ for ___.",
    "practiceExamples": [
      "I have enough food for this meal."
    ],
    "ready": true,
    "titleChinese": "两个人的食物",
    "phonetic": "/əˈnʌf/"
  },
  {
    "id": "story-09-rain",
    "sourceId": "story-09-rain",
    "title": "Water from the sky",
    "wordId": "rain",
    "courseWeek": 9,
    "week": 9,
    "definition": "water falling from clouds",
    "definitionChinese": "从云中落下的雨水",
    "reviewWordIds": [
      "cloud",
      "water",
      "window",
      "garden"
    ],
    "narrator": "The girl in red is speaking.",
    "narratorChinese": "窗边观察的人",
    "contextSupport": [
      {
        "text": "now",
        "definition": "at this time",
        "chinese": "现在，此刻"
      }
    ],
    "pages": [
      {
        "text": "There are clouds over the garden.",
        "chinese": "花园上空有云。",
        "file": "rain-1.webp",
        "alt": "I look at clouds over a garden from my window.",
        "semanticText": null
      },
      {
        "text": "Now there is rain.",
        "chinese": "现在下雨了。",
        "file": "rain-2.webp",
        "alt": "I watch rain through the window.",
        "semanticText": null
      },
      {
        "text": "The rain gives water to the flowers.",
        "chinese": "雨给花朵带来水。",
        "file": "rain-3.webp",
        "alt": "Rain falls on the flowers in the garden.",
        "semanticText": null
      },
      {
        "text": "I look at the rain from my window.",
        "chinese": "我从窗边看雨。",
        "file": "rain-4.webp",
        "alt": "I am at home and watch the rain outside.",
        "semanticText": null
      }
    ],
    "check": {
      "prompt": "Water falls from clouds. Is this rain?",
      "options": [
        "Yes.",
        "No, it is a cup."
      ],
      "correctIndex": 0,
      "success": "Correct. Rain is water falling from clouds.",
      "retry": "Look again at the question.",
      "chinese": "水从云中落下来，这是雨吗？"
    },
    "practice": "There is rain in ___.",
    "practiceExamples": [
      "There is rain in the garden."
    ],
    "ready": true,
    "titleChinese": "天空落下的水",
    "phonetic": "/reɪn/"
  },
  {
    "id": "story-38-seed",
    "sourceId": "story-38-seed",
    "title": "From a small seed",
    "wordId": "seed",
    "courseWeek": 38,
    "week": 38,
    "definition": "a small part of a plant from which a new plant can come",
    "definitionChinese": "能在适当条件下长成新植物的种子",
    "reviewWordIds": [
      "plant",
      "pot",
      "water",
      "growth"
    ],
    "narrator": "The person with the seed is speaking.",
    "narratorChinese": "播种的人",
    "contextSupport": [],
    "pages": [
      {
        "text": "I have a small seed.",
        "chinese": "我有一粒小种子。",
        "file": "seed-1.webp",
        "alt": "I have a small seed near a pot of earth.",
        "semanticText": null
      },
      {
        "text": "I put the seed in the earth in a pot.",
        "chinese": "我把种子放进花盆的土里。",
        "file": "seed-2.webp",
        "alt": "I put the seed in the earth in a pot.",
        "semanticText": null
      },
      {
        "text": "I give it water and time.",
        "chinese": "我给它水，也给它时间。",
        "file": "seed-3.webp",
        "alt": "I give water to the seed over some days.",
        "semanticText": {
          "kind": "time",
          "label": "Over some days",
          "lines": [],
          "accessibleSummary": "I give the seed water over some days."
        }
      },
      {
        "text": "A young plant comes from the seed.",
        "chinese": "一株幼小的植物从种子长出来。",
        "file": "seed-4.webp",
        "alt": "A young plant comes from the seed.",
        "semanticText": {
          "kind": "time",
          "label": "After some days",
          "lines": [],
          "accessibleSummary": "After some days, a young plant comes from the seed."
        }
      }
    ],
    "check": {
      "prompt": "What can a new plant come from?",
      "options": [
        "A metal key.",
        "A seed."
      ],
      "correctIndex": 1,
      "success": "Correct. A new plant can come from a seed when conditions are right.",
      "retry": "Look again at the question.",
      "chinese": "在合适条件下，新植物能从什么长出来？"
    },
    "practice": "A ___ can come from a seed.",
    "practiceExamples": [
      "A tree can come from a seed."
    ],
    "ready": true,
    "titleChinese": "从一粒种子开始",
    "phonetic": "/siːd/"
  },
  {
    "id": "story-51-so",
    "sourceId": "story-51-so",
    "title": "Rain changes my day",
    "wordId": "so",
    "courseWeek": 51,
    "week": 51,
    "definition": "used to show what comes after a reason",
    "definitionChinese": "在原因之后引出相应结果",
    "reviewWordIds": [
      "rain",
      "home",
      "garden",
      "read"
    ],
    "narrator": "The person in blue is speaking.",
    "narratorChinese": "下雨时留在家里的人",
    "contextSupport": [],
    "pages": [
      {
        "text": "I want to go to the garden.",
        "chinese": "我想去花园。",
        "file": "so-1.webp",
        "alt": "My friend and I want to go to the garden.",
        "semanticText": null
      },
      {
        "text": "There is rain, so I am at home.",
        "chinese": "下雨了，所以我在家里。",
        "file": "so-2.webp",
        "alt": "There is rain. I put my bag back. My friend and I are at home.",
        "semanticText": {
          "kind": "causeAndEffect",
          "label": "The same reason and effect",
          "lines": [
            "There is rain, so I am at home.",
            "I am at home because there is rain."
          ],
          "accessibleSummary": "Rain is the reason. Being at home is the effect."
        }
      },
      {
        "text": "I am at home, so I can read with my friend.",
        "chinese": "我在家里，所以可以和朋友一起读书。",
        "file": "so-3.webp",
        "alt": "My friend and I open a book at home.",
        "semanticText": null
      },
      {
        "text": "I do not go to the garden. I read at home.",
        "chinese": "我不去花园了。我在家读书。",
        "file": "so-4.webp",
        "alt": "My friend and I read at home. There is rain.",
        "semanticText": null
      }
    ],
    "check": {
      "prompt": "The cup is empty, so I put water in it. What is the effect?",
      "options": [
        "I put water in the cup.",
        "The cup was empty."
      ],
      "correctIndex": 0,
      "success": "Correct. The empty cup is the reason. Putting water in it is the effect.",
      "retry": "Look again at the question.",
      "chinese": "杯子空了，所以我往里面倒水，结果是哪件事？"
    },
    "practice": "___, so ___.",
    "practiceExamples": [
      "There is rain, so I am at home."
    ],
    "ready": true,
    "titleChinese": "下雨后改变计划",
    "phonetic": "/səʊ/"
  }
];
