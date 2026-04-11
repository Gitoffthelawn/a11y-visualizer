export const en = {
  title: "Lists",
  intro:
    "Lists group related items together and must use proper HTML elements so assistive technologies can convey their structure and item count.",
  sections: {
    unorderedLists: { title: "Unordered Lists" },
    orderedLists: { title: "Ordered Lists" },
    definitionLists: { title: "Definition Lists" },
    menu: { title: "Menu" },
    ariaListRoles: { title: "ARIA List Roles" },
  },
  examples: {
    unorderedLists: {
      proper: {
        title: "Proper <ul> with <li>",
        desc: "✅ A standard unordered list with proper li elements. Screen readers announce the list and item count.",
      },
      divWrapped: {
        title: "<ul> with <li> wrapped in <div>",
        desc: "❌ List items wrapped in a div inside ul. The div is not a valid direct child of ul, breaking the list semantics.",
      },
    },
    orderedLists: {
      proper: {
        title: "Proper <ol> with <li>",
        desc: "✅ A standard ordered list with proper li elements. Screen readers announce the list, item count, and item positions.",
      },
    },
    definitionLists: {
      proper: {
        title: "Proper <dl> with <dt> and <dd>",
        desc: "✅ A standard definition list with dt (term) and dd (description) elements.",
      },
      multipleDd: {
        title: "<dl> with multiple <dd> per <dt>",
        desc: "✅ A definition list where one term has multiple descriptions. This is a valid structure.",
      },
      divGrouped: {
        title: "<dl> with <div> grouping",
        desc: "✅ A definition list using div elements to group dt/dd pairs. This is allowed by the HTML specification.",
      },
      invalidChild: {
        title: "<dl> with invalid <span> child",
        desc: "❌ A definition list containing a span element as a direct child. Only dt, dd, and div elements are valid children of dl.",
      },
      outsideDl: {
        title: "<dt>/<dd> outside <dl>",
        desc: "❌ Definition list items (dt/dd) placed outside of a dl element. They lose their semantic meaning.",
      },
    },
    menu: {
      proper: {
        title: "Proper <menu> with <li>",
        desc: "✅ A menu element with proper li children. The menu element is semantically equivalent to ul.",
      },
    },
    ariaListRoles: {
      proper: {
        title: 'role="list" with role="listitem"',
        desc: '✅ A custom list structure using ARIA roles. The container has role="list" and items have role="listitem".',
      },
      orphanedListitem: {
        title: 'role="listitem" outside role="list"',
        desc: '❌ An element with role="listitem" that is not inside an element with role="list". The listitem role requires a list context.',
      },
    },
  },
} as const;

export const ja = {
  title: "リスト",
  intro:
    "リストは関連する項目をグループ化します。支援技術が構造や項目数を伝えられるよう、適切なHTML要素を使用する必要があります。",
  sections: {
    unorderedLists: { title: "順不同リスト" },
    orderedLists: { title: "順序付きリスト" },
    definitionLists: { title: "定義リスト" },
    menu: { title: "メニュー" },
    ariaListRoles: { title: "ARIA リストロール" },
  },
  examples: {
    unorderedLists: {
      proper: {
        title: "正しい <ul> と <li>",
        desc: "✅ 標準的な順不同リスト。スクリーンリーダーはリストと項目数を読み上げます。",
      },
      divWrapped: {
        title: "<ul> 内の <li> を <div> で囲んだ構造",
        desc: "❌ ul の直下に div があり、その中に li がある構造。div は ul の直接の子要素として無効で、リストの意味が壊れます。",
      },
    },
    orderedLists: {
      proper: {
        title: "正しい <ol> と <li>",
        desc: "✅ 標準的な順序付きリスト。スクリーンリーダーはリスト、項目数、各項目の順序を読み上げます。",
      },
    },
    definitionLists: {
      proper: {
        title: "正しい <dl> と <dt> / <dd>",
        desc: "✅ 標準的な定義リスト。dt（用語）と dd（説明）で構成されます。",
      },
      multipleDd: {
        title: "<dd> が連続する <dl>",
        desc: "✅ 1つの用語に対して複数の説明がある定義リスト。これは有効な構造です。",
      },
      divGrouped: {
        title: "<div> でグルーピングされた <dl>",
        desc: "✅ div 要素で dt/dd のペアをグループ化した定義リスト。HTML仕様で許可されています。",
      },
      invalidChild: {
        title: "<dl> 直下に無効な <span> がある",
        desc: "❌ dl の直接の子要素に span が含まれています。dl の子要素として有効なのは dt、dd、div のみです。",
      },
      outsideDl: {
        title: "<dt>/<dd> が <dl> の外にある",
        desc: "❌ 定義リストの項目（dt/dd）が dl 要素の外に配置されています。意味的な関連が失われます。",
      },
    },
    menu: {
      proper: {
        title: "正しい <menu> と <li>",
        desc: "✅ menu 要素と li 子要素による構成。menu 要素は意味的に ul と同等です。",
      },
    },
    ariaListRoles: {
      proper: {
        title: 'role="list" と role="listitem"',
        desc: '✅ ARIA ロールを使用したカスタムリスト構造。コンテナに role="list"、項目に role="listitem" を指定しています。',
      },
      orphanedListitem: {
        title: 'role="listitem" が role="list" の外にある',
        desc: '❌ role="listitem" を持つ要素が role="list" を持つ要素の中にありません。listitem ロールにはリストコンテキストが必要です。',
      },
    },
  },
} as const;
