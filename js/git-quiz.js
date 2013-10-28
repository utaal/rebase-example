(function() {
  $(initQuiz);

  var QUESTION_SECONDS = 5;

  var QUESTIONS = [
    {
      title: 'To rebase `experiment` on `master`, I must be…',
      answers: [
        { text: 'on `experiment`', correct: false },
        { text: 'on `master`', correct: false },
        { text: 'on both', correct: false },
        { text: 'I can be anywhere, actually', correct: true }
      ]
    },
    {
      title: 'If I am on `master` and want to rebase `experiment` on it, I just do…',
      answers: [
        { text: '`git rebase master`', correct: false },
        { text: '`git rebase experiment`', correct: false },
        { text: '`git rebase master experiment`', correct: true },
        { text: '`git rebase experiment master`', correct: false }
      ]
    },
    {
      title: 'I use the `--onto` option when…',
      answers: [
        { text: 'I don’t want to rebase all commits not shared with upstream', correct: true },
        { text: 'I need to rebase on an ancestor', correct: false },
        { text: 'I need to rebase on a remote branch', correct: false },
        { text: 'I want to force duplicate commits', correct: false }
      ]
    },
    {
      title: 'When I want to squash multiple attempts at a bugfix in one single commit, I generally use the todo verb…',
      answers: [
        { text: '`squash`', correct: false },
        { text: '`fixup`', correct: true },
        { text: '`bugfix`', correct: false },
        { text: '`fix`', correct: false }
      ]
    }
  ];

  var templater = $.noop, qIndex = -1, score = 0, container, remaining, counter, countdown;

  function checkAnswer(e) {
    clearInterval(counter);
    counter = countdown = null;
    container.find('input').attr('disabled', true);
    var item, correct = false;
    if (e) {
      item = $(e.currentTarget).closest('.radio');
      correct = $(e.currentTarget).data('correct');
    }
    if (correct) {
      ++score;
      if (item)
        item.addClass('has-success').append(" — Your score is now " + score);
    } else {
      if (item)
        item.addClass('has-error');
      container.find('input[data-correct="true"]').closest('.radio').addClass('has-success');
    }
  }

  function countDown() {
    --remaining;
    countdown = countdown || container.find('.countdown');
    countdown.text(formatTime(remaining));

    if (remaining > 0)
      return;

    checkAnswer();
  }

  function formatTime(seconds) {
    var mins = Math.floor(seconds / 60), secs = seconds % 60;
    if (mins < 10) mins = '0' + mins;
    if (secs < 10) secs = '0' + secs;
    return mins + ':' + secs;
  }

  Handlebars.registerHelper('format_time', formatTime);

  function initQuiz() {
    templater = Handlebars.compile($('#template').html());
    container = $('#question');
    container.on('click', 'a.next', nextQuestion);
    container.on('click', 'input[type="radio"]', checkAnswer);
  }

  var CODE_REGEX    = /`(.+?)`/g;
  var CODE_REPLACER = '<tt>$1</tt>';

  function nextQuestion(e) {
    if (e)
      e.preventDefault();

    var question = QUESTIONS[++qIndex];
    if (!question || !question.title)
      return wrapUp();

    question.title = question.title.replace(CODE_REGEX, CODE_REPLACER);
    for (var index = 0, len = question.answers.length; index < len; ++index)
      question.answers[index].text = question.answers[index].text.replace(CODE_REGEX, CODE_REPLACER);
    question.remaining = remaining = QUESTION_SECONDS;
    container.removeClass('jumbotron').html(templater(question));
    counter = setInterval(countDown, 1000);
  }

  function wrapUp() {
    var markup = Handlebars.compile($('#wrapUp').html())({ score: score, total: QUESTIONS.length, huzzah: score >= 3 });
    container.html(markup);
  }
})();
