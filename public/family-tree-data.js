/**
 * شجرة أسرة آل بوعبيد — البيانات الرسمية
 * مصدر البنية: جدارية "شجرة أسرة آل بوعبيد من العبادل من بني تميم" (الإصدار الأول 1447/1/1هـ)
 * الجذع الموثق: عبدالله ← محمد ← صالح ← أحمد ← الفروع السبعة المعاصرة.
 */
window.AL_BU_OBAID_TREE = {
  name: "عبدالله",
  title: "الجد الجامع",
  isRoot: true,
  children: [
    {
      name: "محمد",
      title: "الجيل الثاني",
      isRoot: true,
      children: [
        {
          name: "صالح",
          title: "الجيل الثالث",
          isRoot: true,
          children: [
            {
              name: "أحمد",
              title: "جد الفروع السبعة",
              isRoot: true,
              children: [
              // --- BRANCH 1: AL SAAD ---
              {
                  name: "آل سعد",
                  title: "الجد سعد بن أحمد",
                  isBranch: true,
                  children: [
                      { 
                          name: "سعد بن عبد العزيز", 
                          children: [
                              { name: "عيسى", children: [{name: "وليد", children: [{name: "عيسى"}, {name: "عبدالرحمن"}, {name: "طارق"}]}, {name: "علي", children: [{name: "محمد"}, {name: "أحمد"}]}, {name: "عبدالرحمن"}] }, 
                              { name: "خالد", children: [{name: "سعد", children: [{name: "خالد"}, {name: "فيصل"}]}, {name: "عبدالرحمن"}, {name: "إبراهيم"}] }, 
                              { name: "وليد", children: [{name: "محمد", children: [{name: "وليد"}, {name: "بندر"}]}, {name: "خالد"}] }, 
                              { name: "بندر", children: [{name: "سعد"}, {name: "عبدالله"}] }, 
                              { name: "فيصل", children: [{name: "محمد"}, {name: "عبدالله"}, {name: "فهد"}, {name: "سلطان"}] },
                              { name: "مانع", children: [{name: "صلاح"}] }
                          ] 
                      },
                      { 
                          name: "سعد بن عبد الرحمن", 
                          children: [
                              { name: "صالح", children: [{name: "عبدالرحمن"}, {name: "فهد"}, {name: "سعود"}, {name: "محمد"}] }, 
                              { name: "إبراهيم", children: [{name: "عبدالعزيز", children: [{name: "إبراهيم"}, {name: "وليد"}]}] }, 
                              { name: "محمد", children: [{name: "سعد", children: [{name: "محمد"}, {name: "علي"}]}] }, 
                              { name: "توفيق", children: [{name: "أحمد"}, {name: "صالح"}, {name: "وليد", children: [{name: "عبدالرحمن"}, {name: "توفيق"}]}] }
                          ] 
                      }
                  ]
              },
              // --- BRANCH 2: AL ABDULRAHMAN ---
              {
                  name: "آل عبدالرحمن",
                  title: "الجد عبدالرحمن بن أحمد",
                  isBranch: true,
                  children: [
                      { 
                          name: "عبد الله", 
                          children: [
                              { name: "جمال", children: [{name: "عبدالله"}, {name: "خالد"}, {name: "طارق"}] }, 
                              { name: "طارق", children: [{name: "عبدالرحمن"}, {name: "محمد"}, {name: "خالد"}, {name: "يزيد"}] }, 
                              { name: "مشاري", children: [{name: "عبدالعزيز"}, {name: "عبدالرحمن"}] },
                              { name: "عبدالرؤوف", children: [{name: "أحمد"}, {name: "فهد"}, {name: "سعود"}] },
                              { name: "سعود", children: [{name: "صالح"}, {name: "عبدالله"}] }
                          ] 
                      },
                      { 
                          name: "عيسى", 
                          children: [
                              { name: "عبد العزيز", children: [{name: "عمر"}, {name: "محمد"}, {name: "عيسى"}, {name: "عبدالله"}] }, 
                              { name: "خالد", children: [{name: "وليد"}, {name: "مشعل"}, {name: "سعد"}, {name: "عادل"}] }, 
                              { name: "ماهر", children: [{name: "عبدالرحمن"}, {name: "عيسى"}, {name: "خالد"}] },
                              { name: "صالح", children: [{name: "سعد"}, {name: "محمد"}] }
                          ] 
                      },
                      { 
                          name: "محمد", 
                          children: [
                              { name: "يوسف", children: [{name: "عبدالله"}, {name: "صالح"}, {name: "أحمد"}, {name: "إبراهيم"}] }, 
                              { name: "يعقوب", children: [{name: "محمد"}, {name: "عبدالرحمن"}] }, 
                              { name: "نادر", children: [{name: "عبدالرحمن"}, {name: "سالم"}] },
                              { name: "فهد", children: [{name: "عبدالعزيز"}, {name: "محمد"}] },
                              { name: "بدر", children: [{name: "خالد"}, {name: "عبدالله"}] },
                              { name: "عبدالباري", children: [{name: "محمد", children: [{name: "فهد"}, {name: "عادل"}]}] }
                          ] 
                      }
                  ]
              },
              // --- BRANCH 3: AL ABDULAZIZ ---
              {
                  name: "آل عبدالعزيز",
                  title: "الجد عبدالعزيز بن أحمد",
                  isBranch: true,
                  children: [
                      { 
                          name: "محمد", 
                          children: [
                              { name: "زياد", children: [{name: "عبدالعزيز"}, {name: "محمد"}] }, 
                              { name: "نبيل", children: [{name: "فهد"}, {name: "صالح"}] }, 
                              { name: "فهد", children: [{name: "سلطان"}, {name: "خالد"}, {name: "عبدالله"}] },
                              { name: "عبدالرحمن", children: [{name: "محمد"}] },
                              { name: "حفاظ", children: [{name: "إبراهيم"}] }
                          ] 
                      },
                      { 
                          name: "علي", 
                          children: [
                              { name: "عبد الله", children: [{name: "محمد"}, {name: "أحمد"}, {name: "إبراهيم"}, {name: "علي"}] }, 
                              { name: "صالح", children: [{name: "عبدالعزيز", children: [{name: "صالح"}]}] }
                          ] 
                      },
                      { 
                          name: "سعد", 
                          children: [
                              { name: "رياض", children: [{name: "عبدالله"}, {name: "سعد"}, {name: "إياد"}] }, 
                              { name: "عصام", children: [{name: "سعد"}, {name: "وليد"}, {name: "محمد"}, {name: "أحمد"}] }, 
                              { name: "ياسر", children: [{name: "سعد"}, {name: "عبدالعزيز"}] },
                              { name: "أحمد", children: [{name: "خالد"}, {name: "سعد"}] }
                          ] 
                      }
                  ]
              },
              // --- BRANCH 4: AL ABDULLATIF ---
              {
                  name: "آل عبداللطيف",
                  title: "الجد عبداللطيف بن أحمد",
                  isBranch: true,
                  children: [
                      { 
                          name: "خالد", 
                          children: [
                              { name: "عبد الله", children: [{name: "خالد"}] }, 
                              { name: "ريان", children: [{name: "خالد"}] },
                              { name: "يوسف", children: [{name: "خالد"}] }
                          ] 
                      },
                      { 
                          name: "سعود", 
                          children: [
                              { name: "محمد", children: [{name: "عبداللطيف"}] }, 
                              { name: "سعد", children: [{name: "سعود"}] },
                              { name: "عبدالرحمن", children: [{name: "فيصل"}, {name: "سعود"}] }
                          ] 
                      },
                      { 
                          name: "عبد المجيد", 
                          children: [
                              { name: "يوسف", children: [{name: "عبدالمجيد"}, {name: "عبداللطيف"}] }, 
                              { name: "أحمد", children: [{name: "صالح"}, {name: "عبدالرحمن"}] }
                          ] 
                      }
                  ]
              },
              // --- BRANCH 5: AL ABDULLAH SALEH ---
              {
                  name: "آل عبدالله صالح",
                  title: "الجد عبدالله بن صالح",
                  isBranch: true,
                  children: [
                      { 
                          name: "محمد", 
                          children: [
                              { name: "وليد", children: [{name: "محمد"}, {name: "صالح"}, {name: "عبدالله"}] }, 
                              { name: "صالح", children: [{name: "عبدالله"}, {name: "محمد"}] }, 
                              { name: "عادل", children: [{name: "محمد"}, {name: "سعد"}] },
                              { name: "مشعل", children: [{name: "سعد"}] }
                          ] 
                      },
                      { 
                          name: "أحمد", 
                          children: [
                              { name: "حمد", children: [{name: "أحمد"}, {name: "عبدالله"}] }, 
                              { name: "عبد العزيز", children: [{name: "عمر"}, {name: "أحمد"}] },
                              { name: "نايف", children: [{name: "أحمد"}] }
                          ] 
                      },
                      { 
                          name: "سعد", 
                          children: [
                              { name: "عبد الرحمن", children: [{name: "سعد"}, {name: "عبدالله"}] }, 
                              { name: "يوسف", children: [{name: "أحمد"}, {name: "سعد"}] },
                              { name: "محمد", children: [{name: "وليد"}, {name: "سعد"}] }
                          ] 
                      }
                  ]
              },
              // --- BRANCH 6: AL MUHAMMAD AHMED ---
              {
                  name: "آل محمد أحمد",
                  title: "الجد محمد بن أحمد",
                  isBranch: true,
                  children: [
                      { 
                          name: "عبد العزيز", 
                          children: [
                              { name: "إبراهيم", children: [{name: "خالد"}, {name: "محمد"}, {name: "أحمد"}, {name: "عبدالعزيز"}] }, 
                              { name: "خالد", children: [{name: "سعد"}, {name: "عبدالعزيز"}] },
                              { name: "يوسف", children: [{name: "عبدالعزيز"}] }
                          ] 
                      },
                      { 
                          name: "عبد الله", 
                          children: [
                              { name: "سلمان", children: [{name: "عبدالله"}] }, 
                              { name: "فواز", children: [{name: "عبدالله"}] },
                              { name: "أحمد", children: [{name: "محمد"}, {name: "عبدالله"}] },
                              { name: "جاسم", children: [{name: "عبدالله"}, {name: "مهند"}] }
                          ] 
                      },
                      { 
                          name: "عيسى", 
                          children: [
                              { name: "أنس", children: [{name: "عيسى"}] }, 
                              { name: "براء", children: [{name: "عيسى"}] },
                              { name: "عمار", children: [{name: "عيسى"}] }
                          ] 
                      }
                  ]
              },
              // --- BRANCH 7: AL YOUSSEF ---
              {
                  name: "آل يوسف",
                  title: "الجد يوسف بن أحمد",
                  isBranch: true,
                  children: [
                      { 
                          name: "محمد", 
                          children: [
                              { name: "عبد الإله", children: [{name: "يوسف"}, {name: "أحمد"}, {name: "محمد"}] }, 
                              { name: "تركي", children: [{name: "محمد"}] }, 
                              { name: "نواف", children: [{name: "فهد"}, {name: "محمد"}] },
                              { name: "فيصل", children: [{name: "محمد"}] }
                          ] 
                      },
                      { 
                          name: "عبد الرحمن", 
                          children: [
                              { name: "صلاح", children: [{name: "عبدالرحمن"}, {name: "يوسف"}] }, 
                              { name: "حمود", children: [{name: "محمد"}, {name: "عبدالرحمن"}] },
                              { name: "يعقوب", children: [{name: "عبدالرحمن"}] },
                              { name: "راشد", children: [{name: "أحمد"}] }
                          ] 
                      },
                      { 
                          name: "عبد اللطيف", 
                          children: [
                              { name: "ماجد", children: [{name: "عبداللطيف"}, {name: "صالح"}, {name: "معاذ"}] }, 
                              { name: "عبد الرزاق", children: [{name: "أحمد"}, {name: "عبداللطيف"}] },
                              { name: "طلال", children: [{name: "عبداللطيف"}] },
                              { name: "صالح", children: [{name: "عبداللطيف"}] },
                              { name: "غانم", children: [{name: "عبداللطيف"}] }
                          ] 
                      }
                  ]
              }
              ]
            }
          ]
        }
      ]
    }
  ]
};
