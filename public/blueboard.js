class BlueDown {
  static TagNames = [
    'bold',
    'underline',
    'h1',
    'h2',
    'h3',
    'blue',
    'image',
    'link',
  ];
  static Tags = [
    '/굵게',
    '/볼드',
    '/bold',
    '/b',

    '/밑줄',
    '/언더라인',
    '/underline',
    '/u',

    '/제목1',
    '/헤더1',
    '/header1',
    '/h1',

    '/제목2',
    '/헤더2',
    '/header2',
    '/h2',

    '/제목3',
    '/헤더3',
    '/header3',
    '/h3',
  ];

  static checkTag(string) {
    const openBracketLocation = string.indexOf('[');
    let mainString;
    let extra;
    if (openBracketLocation === -1) {
      // 대괄호 열기가 없으면
      mainString = string; // tag 명 그대로
      extra = ''; // tag에 대괄호 없으니 빈 문자열
    } else {
      // 대괄호 열기가 있으면
      if (
        string.split('').filter((char) => char === '[').length === 1 && // [ 가 오로지 1개이고
        string.split('').filter((char) => char === ']') && // ]도 오로지 1개이고
        string.indexOf(']') === string.length - 1 // ]가 tag의 가장 뒤에 위치하면
      ) {
        mainString = string.split('').slice(0, openBracketLocation).join(''); // 대괄호 이전 것만 tag 명으로
        extra = string
          .split('')
          .slice(openBracketLocation + 1, string.length - 1)
          .join(''); // [ ] 사이의 것 반환
      } else {
        mainString = string; // tag 가 아니므로 전체 문자열 주기
      }
    }

    const mainStringIndex = BlueDown.Tags.indexOf(mainString);
    if (mainStringIndex === -1) {
      // tag 목록에 없으면
      return {
        serial: -1,
        extra: '',
      }; // tag 아님 반환
    } else {
      return {
        serial: parseInt(BlueDown.Tags.indexOf(mainString) / 4),
        extra,
      }; // tag 일련번호와 [ ] 사이의 것 반환
    }
  }

  static pushSpan(parent, string, extra, features) {
    if (extra === '') {
      // [ ] 없는 일반적인 상황에서
      if (string === '\n') {
        // \n 이어서 <br> 넣어야 할 때
        const br = document.createElement('br');
        parent.appendChild(br);
      } else {
        // 일반적인 문자열이면
        const span = document.createElement('span');
        for (let feature of features) {
          if (BlueDown.TagNames.indexOf(feature) !== -1) {
            span.classList.add(feature);
          }
        } // span tag에 특성 (bold, underline, h1...) 추가
        span.innerHTML = string;
        parent.appendChild(span);
      }
    } else {
      // [ ] 있는 즉, image tag 나 link tag 이면
      // if (features[0] === 'image') {
      //   const img = document.createElement('img');
      //   let i;
      //   for (
      //     i = 0;
      //     imageFiles.files[i].name.replaceAll(' ', '') !== extra;
      //     i++
      //   ) {}
      //   const fileToAppy = imageFiles.files[i];
      //   img.src = URL.createObjectURL(fileToAppy);
      //   parent.appendChild(img);
      // }
      // if (features[0] === 'link') {
      //   const a = document.createElement('a');
      //   a.href = extra;
      //   a.textContent = extra;
      //   a.target = '_blank';
      //   parent.appendChild(a);
      // }
    }
  }

  static separate(string) {
    let underlineExist = false;

    const separated = string
      .replaceAll(' ', '[ENTER]')
      .replaceAll('\n', '[ENTER]\n[ENTER]')
      .split('[ENTER]'); // 띄어쓰기 기준으로 문자열 나누되 \n은 따로 취급
    let realResult = [];
    separated.forEach((char, index) => {
      const nextChar = index < separated.length - 1 ? separated[index + 1] : '';
      if (nextChar === '\n') {
        realResult.push(char);
        // Enter 치기 전에는 띄어쓰기 없음
      } else if (BlueDown.checkTag(nextChar).serial === 1 && underlineExist) {
        realResult.push(char);
        // 닫는 underline 전에는 띄어쓰기 없음
      } else {
        realResult.push(char);
        realResult.push(' '); // 나머지는 다 뒤에 공백 추가
      }

      if (BlueDown.checkTag(nextChar).serial === 1) {
        underlineExist = !underlineExist;
      } // underline true -> 여는 거 있음, false -> 닫는 거 있음 or 아예 없음
    });
    return realResult;
  }

  static activateAutoFill(target) {
    let prevInputValue = target.value;
    target.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
      } else {
        return;
      }

      const text = target.value.replaceAll('\n', ' ');
      let startingIndex = target.selectionStart;
      let endingIndex = target.selectionStart;

      while (true) {
        if (startingIndex <= 0) {
          break;
        }
        if (
          text[startingIndex] === ' ' &&
          startingIndex !== target.selectionStart
        ) {
          startingIndex++;
          break;
        }
        startingIndex--;
      }

      const currentFocusingString = text.slice(startingIndex, endingIndex);
      const currentFocusingStringSerial = BlueDown.checkTag(
        currentFocusingString
      ).serial;
      if (
        currentFocusingStringSerial >= 0 &&
        currentFocusingStringSerial <= 5
      ) {
        const shouldAddSpace =
          (target.value.slice(endingIndex, target.value.length) + '!')[0] !==
          ' ';
        target.value =
          target.value.slice(0, endingIndex) +
          '  ' +
          currentFocusingString +
          (shouldAddSpace ? ' ' : '') +
          target.value.slice(endingIndex, target.value.length);
        target.selectionStart = endingIndex + 1;
        target.selectionEnd = endingIndex + 1;
        target.focus();
      }

      prevInputValue = target.value;
    });
  }

  static apply(originalString, parent) {
    parent.innerHTML = ''; // 출력할 곳 비우기

    const stack = [];
    const string = BlueDown.separate(originalString);

    for (let part of string) {
      const tagChecking = BlueDown.checkTag(part);
      const serial = tagChecking.serial; // tag 일련번호 받기
      const extra = tagChecking.extra; // [ ] 안의 내용 받기
      if (serial === -1) {
        // tag가 아니면 그냥 출력
        BlueDown.pushSpan(parent, part, '', stack);
      } else {
        // tag가 아닌 것이 아니면 (맞으면)
        const name = BlueDown.TagNames[serial]; // tag 이름 받기
        if (name !== 'image' && name !== 'link') {
          // image tag나 link tag가 아니면 -> 닫는 tag 있는 tag 면
          if (stack.at(-1) === name) {
            stack.pop();
          } else {
            stack.push(name);
          }
        } else {
          // image tag나 link tag 일 경우
          BlueDown.pushSpan(parent, '', extra, [name]);
        }
      }
    }

    if (stack.length !== 0) {
      // stack에 무언가 들어있으면 -> tag 안 닫으면 (등등)
      alert('IMPOSSIBLE STRUCTURE');
      parent.innerHTML = '';
    }
  }
}

// imageFiles.addEventListener('change', () => {
//   const files = imageFiles.files;
//   imageList.innerHTML = '';
//   for (let file of files) {
//     const li = document.createElement('li');
//     li.textContent = file.name.replaceAll(' ', '');
//     imageList.appendChild(li);
//   }
// });

// BlueDown.activateAutoFill(inputArea);

// submit.addEventListener('click', () => {
//   const string = inputArea.value;
//   BlueDown.apply(string, outputArea);
// });

// document.onkeydown = (e) => {
//   if (e.ctrlKey && e.key === 'Enter') {
//     submit.click();
//   }
// };
