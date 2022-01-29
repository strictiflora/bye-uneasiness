#!/usr/bin/env node

const { MultiSelect } = require('enquirer');
const { Toggle } = require('enquirer');

function main () {
  console.clear();
  console.log('あなたのモヤモヤをざっくり箇条書きで入力してください:');
  console.log('(Ctrl+dまたはcommand+dで入力終了)');

  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  const lines = [];
  const reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  reader.on('line', (line) => {
    if (line) {
      lines.push(line);
    }
  });

  reader.on('close', () => {
    if (isSelectable(lines)) select(lines);
  });

  process.on('cancel', function () {
    process.exit();
  });
}

function isSelectable (array) {
  return array.length > 0;
}

const validation = (selectedItems) => {
  if (isSelectable(selectedItems)) {
    return true;
  }
  return 'どれか選択してください';
};

async function select (lines) {
  console.clear();
  const nonApplicable = '該当なし';
  if (isSelectable(lines)) lines.push(nonApplicable);

  const prompt1 = new MultiSelect({
    message: 'この中で現在進行中または未来の出来事を選択してください\n(半角英数入力モードでのSpaceキーで選択、Enterで選択終了)',
    limit: 15,
    choices: lines,
    validate: validation
  });

  await prompt1.run()
    .then()
    .catch(console.error);

  const abortMessage = '\nあなたの行動次第で解消できるモヤモヤは今はありません。\n\n過去の出来事、他人の行動は自分では変えられないので、\nゆっくり休んで楽しいことにフォーカスしてくださいね🍵';
  if (prompt1.value.includes(nonApplicable)) {
    displayAbortMessage(abortMessage);
    return;
  }

  if (isSelectable(prompt1.value)) prompt1.value.push(nonApplicable);
  console.clear();
  const prompt2 = new MultiSelect({
    message: 'この中で自分でコントロールできるものを選択してください。\n  解決するために誰かが変わる・行動する必要があるものは除きます。',
    limit: 15,
    choices: prompt1.value,
    validate: validation
  });

  prompt2.run()
    .then(answer => {
      if (answer.includes(nonApplicable)) {
        displayAbortMessage(abortMessage);
        return;
      }
      showLastMessage(answer);
    })
    .catch(console.error);
}

function displayAbortMessage (message) {
  console.clear();
  console.log(message);
}

function showLastMessage (answer) {
  console.clear();
  console.log('あなたの行動次第で解消できるモヤモヤは:\n');
  answer.forEach(line => console.log(`・${line}`));
  console.log('\n------------------------------------------------------------');
  console.log('モヤモヤしたら以上の結果にフォーカスして対策を考えてみてください。\nもしまだ結果が漠然としているなら、モヤモヤをもう少し細かく分けてみてくださいね。');
  startAgain();
}

function startAgain () {
  const prompt3 = new Toggle({
    message: '最初からやり直しますか？',
    enabled: 'Yes',
    disabled: 'No'
  });

  prompt3.run()
    .then(answer => {
      if (answer) {
        main();
      }
    })
    .catch(console.error);
}

main();
