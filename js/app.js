var app = {

  init: function() {},

  game: {
    initGame: function() {
      app.slots.initSlots();
      app.cards.allocateCards();
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
    guessRound: function() {
      function checkProgress(){
        if (app.game.guessesMade === app.game.guessesInRound) {
          clearInterval(app.game.gameTimer);
          console.log("finally motherfucker");
        }
      }
      app.cards.firstCard = "";
      app.game.guessesInRound = 1;
      app.game.guessesMade = 0;
      app.game.gameTimer = setInterval(checkProgress, 1000);

    }
  },

  slots: {
    initSlots: function() {
      for (var i=0;i<16;i++){
        app.slots[i] = {
          card: "",
          matches: 0
        };
        $('#slot'+i).on('click', app.slots.checkSlot);
      }
    },
    checkSlot: function() {
      if (app.game.guessesMade === app.game.guessesInRound) {
        return;
      }
      app.game.guessesMade++;
      var clickedCard = app.slots[event.target.id.slice(4)].card;
      app.slots.viewSlot(clickedCard);
      app.cards.compareCards(clickedCard);
      if (app.game.guessesInRound === 1) {
        app.game.guessesInRound = app.slots[event.target.id.slice(4)].matches;
        app.cards.firstCard = clickedCard;
      }
    },
    viewSlot: function(card) {
      $(event.target).attr('src', card);
    }
  },

  cards: {
    cardSet: cardSet,
    allocateCards: function() {
      var numTripleCards = Math.max(0, app.game.difficulty - 1) * 2;
      var numDoubleCards = (16 - numTripleCards * 3) / 2;
      var randCards = _.sample(app.cards.cardSet, numTripleCards + numDoubleCards);
      var tripleCards = randCards.slice(0, numTripleCards);
      var doubleCards = randCards.slice(numTripleCards);
      var slotCards = [];
      for (var i=0; i<numTripleCards; i++) {
        slotCards.push([tripleCards[i], 3]);
        slotCards.push([tripleCards[i], 3]);
        slotCards.push([tripleCards[i], 3]);
      }
      for (var i=0; i<numDoubleCards; i++) {
        slotCards.push([doubleCards[i], 2]);
        slotCards.push([doubleCards[i], 2]);
      }
      slotCards = _.shuffle(slotCards);
      for (var i=0; i<16; i++) {
        app.slots[i].card = slotCards[i][0];
        app.slots[i].matches = slotCards[i][1];
      }
    },
    compareCards: function(card){
      if (app.cards.firstCard && app.cards.firstCard !== card) {
        // do a round end loss thingo
        console.log("nawww that's shit u lose");
      }
    },
    firstCard: ""
  }

}