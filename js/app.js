var app = {

  init: function() {
    app.game.difficulty = 2; //PLACEHOLDER
    app.game.initGame(); //PLACEHOLDER
  },

  game: {
    initGame: function() {
      app.slots.initSlots();
      app.cards.allocateCards('blue');
      app.cards.allocateCards('red');
    },
    difficulty: 1,
    difficultyNames: ["Child's play", "Adventure", "Challenge", "Torture"],
    toggleDifficulty: function() {
      if (app.game.difficulty === 3) {
        app.game.difficulty = 0;
      } else {
        app.game.difficulty++;
      }
    },
    guessesInRound: 0,
    guessesMade: 0,
    checkProgress: function() {
      if (app.game.guessesMade === app.game.guessesInRound) {
        clearInterval(app.game.gameTimer);
        console.log("guessRound end motherfucker");
        app.game.swapPlayer();
      }
    },
    guessRound: function() {
      app.cards.firstCard = "";
      app.slots.openSlot1 = "";
      app.slots.openSlot2 = "";
      app.slots.openSlot3 = "";
      app.game.guessesInRound = 1;
      app.game.guessesMade = 0;
      app.game.gameTimer = setInterval(app.game.checkProgress, 1000);
    },
    swapPlayer: function() {
      // PLACEHOLDER
    }
  },

  slots: {
    initSlots: function() {
      for (var i = 0; i < 16; i++) {
        app.slots['blue' + i] = {
          card: "",
          matches: 0
        };
        app.slots['red' + i] = {
          card: "",
          matches: 0
        };
        $('#blue'+i).on('click', app.slots.checkSlot);
        $('#red'+i).on('click', app.slots.checkSlot);
      }
    },
    printSlots: function() {
      for (var i = 0; i < 16; i++) {
        console.log('blue slot ', i, ' card ', app.slots['blue' + i].card);
        console.log('red slot ', i, ' card ', app.slots['red' + i].card);
      }
    },
    checkSlot: function() {
      if (app.game.guessesMade === app.game.guessesInRound) {
        return;
      }
      app.game.guessesMade++;
      var clickedSlot = event.target.id.slice(4);
      var clickedCard = app.slots[app.player.active + clickedSlot].card;
      app.slots['openSlot'+app.game.guessesMade] = clickedSlot;
      app.slots.viewSlot(clickedCard);
      app.cards.compareCards(clickedCard);
      if (app.game.guessesInRound === 1) {
        app.game.guessesInRound = app.slots[app.player.active + clickedSlot].matches;
        app.cards.firstCard = clickedCard;
      }
    },
    viewSlot: function(card) {
      $(event.target).attr('src', card);
    },
    resetSlot: function(slot) {
      // disable clicks for a while?
      setTimeout(function() {
        $('#' + app.player.active + slot).attr('src', 'images/' + app.player.active + '.jpg');
      }, (3.5-app.game.difficulty)*1000);
    },
    openSlot1: '',
    openSlot2: '',
    openSlot3: ''
  },

  cards: {
    blueCardSet: blueCardSet,
    redCardSet: redCardSet,
    allocateCards: function(color) {
      // add function and run for blue & red; change slot i everywhere to blue i or red i
      var numTripleCards = Math.max(0, app.game.difficulty - 1) * 2;
      var numDoubleCards = (16 - numTripleCards * 3) / 2;
      var randCards = _.sample(app.cards[color + 'CardSet'], numTripleCards + numDoubleCards);
      var tripleCards = randCards.slice(0, numTripleCards);
      var doubleCards = randCards.slice(numTripleCards);
      var slotCards = [];
      for (var i = 0; i < numTripleCards; i++) {
        slotCards.push([tripleCards[i], 3]);
        slotCards.push([tripleCards[i], 3]);
        slotCards.push([tripleCards[i], 3]);
      }
      for (var i = 0; i < numDoubleCards; i++) {
        slotCards.push([doubleCards[i], 2]);
        slotCards.push([doubleCards[i], 2]);
      }
      slotCards = _.shuffle(slotCards);
      for (var i = 0; i < 16; i++) {
        app.slots[color + i].card = slotCards[i][0];
        app.slots[color + i].matches = slotCards[i][1];
      }
    },
    compareCards: function(card) {
      if (app.cards.firstCard && app.cards.firstCard !== card) {
        for (var i = 1; i <= app.game.guessesMade; i++) {
          var slotToReset = app.slots['openSlot' + i];
          app.slots.resetSlot(slotToReset);
        }
        app.game.guessesInRound = 0;
        app.game.guessesMade = 0;
      }
    },
    firstCard: ""
  },
  player: {
    blue: {},
    red: {},
    active: "blue"
  }
}

$(document).ready(app.init);

// add transitions
// win condition
// 2player lol