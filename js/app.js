var app = {

  init: function() {
    app.game.enableButtons();
  },

  game: {
    initGame: function() {
      app.game.disableButtons();
      $('.boss>img').attr('src', _.sample(bossSet));
      app.game.difficultyTimer = (4 - app.game.difficulty) * 1000;
      app.slots.initSlots();
      app.cards.allocateCards('blue');
      app.cards.allocateCards('red');
      app.game.guessRound();
    },
    difficulty: 1,
    difficultyNames: ["Casual", "Normal", "Challenge", "Torture"],
    difficultyTimer: 0,
    toggleDifficulty: function() {
      if (app.game.difficulty === 3) {
        app.game.difficulty = 0;
      } else {
        app.game.difficulty++;
      }
      $(".difficulty").html(app.game.difficultyNames[app.game.difficulty]);
    },
    guessesInRound: 0,
    guessesMade: 0,
    checkProgress: function() {
      if (app.game.guessesMade === app.game.guessesInRound) {
        if (app.game.guessesMade > 0) {
          if (app.slots.openSlot1) {app.slots[app.slots.openSlot1].won = true;}
          if (app.slots.openSlot2) {app.slots[app.slots.openSlot2].won = true;}
          if (app.slots.openSlot3) {app.slots[app.slots.openSlot3].won = true;}
        }
        clearInterval(app.game.gameTimer);
        setTimeout(app.game.swapPlayer, app.game.difficultyTimer);
      }
    },
    guessRound: function() {
      $('.hero-' + app.player.active).toggleClass('inactive');
      app.cards.firstCard = "";
      app.slots.openSlot1 = "";
      app.slots.openSlot2 = "";
      app.slots.openSlot3 = "";
      app.game.guessesInRound = 1;
      app.game.guessesMade = 0;
      app.game.gameTimer = setInterval(app.game.checkProgress, 1000);
    },
    swapPlayer: function() {
      for (var i = 0; i < 16; i++) {
        $('#' + app.player.active + i).toggleClass('hide');
      }
      $('.hero-' + app.player.active).toggleClass('inactive');
      if (app.player.quantity === 2) {
        if (app.player.active === "blue"){
          app.player.active = "red";
        } else {
          app.player.active = "blue";
        }        
      }
      for (var i = 0; i < 16; i++) {
        $('#' + app.player.active + i).toggleClass('hide');
      }
      app.game.guessRound();
    },
    enableButtons: function(){
      $('#play').on('click', app.game.initGame);
      $('#difficulty').on('click', app.game.toggleDifficulty);
      $('#players').on('click', app.player.togglePlayers);
      $('button').toggleClass('inactive');
    },
    disableButtons: function(){
      $('#play').off('click', app.game.initGame);
      $('#difficulty').off('click', app.game.toggleDifficulty);
      $('#players').off('click', app.player.togglePlayers);
      $('button').toggleClass('inactive');
    }
  },

  slots: {
    initSlots: function() {
      for (var i = 0; i < 16; i++) {
        app.slots['blue' + i] = {
          card: "",
          matches: 0,
          won: false
        };
        app.slots['red' + i] = {
          card: "",
          matches: 0,
          won: false
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
      //catches game not ready for slot click
      if (app.game.guessesMade === app.game.guessesInRound) {
        return;
      }
      var clickedSlot = event.target.id;
      //catches multiple clicks same slot
      if (clickedSlot === app.slots['openSlot' + app.game.guessesMade]) {
        return;
      }
      //catches clicks on won slot
      if (app.slots[clickedSlot].won) {
        return;
      }
      app.game.guessesMade++;
      var clickedCard = app.slots[clickedSlot].card;
      app.slots['openSlot'+app.game.guessesMade] = clickedSlot;
      app.slots.viewSlot(clickedCard);
      app.cards.compareCards(clickedCard);
      if (app.game.guessesInRound === 1) {
        app.game.guessesInRound = app.slots[clickedSlot].matches;
        app.cards.firstCard = clickedCard;
      }
    },
    viewSlot: function(card) {
      $(event.target).attr('src', card);
    },
    resetSlot: function(slot, color) {
      setTimeout(function() {
        $('#' + slot).attr('src', 'images/' + color + '.png');
      }, app.game.difficultyTimer);
    },
    openSlot1: '',
    openSlot2: '',
    openSlot3: ''
  },

  cards: {
    blueCardSet: blueCardSet,
    redCardSet: redCardSet,
    allocateCards: function(color) {
      var numTripleCards = Math.max(0, 2 - app.game.difficulty) * 2;
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
          app.slots.resetSlot(slotToReset, app.player.active);
        }
        app.game.guessesInRound = 0;
        app.game.guessesMade = 0;
      }
    },
    firstCard: ""
  },
  player: {
    quantity: 2,
    togglePlayers: function() {
      if (app.player.quantity === 2) {
        app.player.quantity = 1;
      } else {
        app.player.quantity = 2;
      }
      $(".players").html(app.player.quantity);
    },
    blue: {},
    red: {},
    active: "blue"
  }
}

$(document).ready(app.init);

// ensure clicking already won card is caught
// ensure clicking first/2nd card when 3 set is caught
// put faeries and dragons onto blank
// 'damage'/score scenario
// high scores & player name (local storage lol)
// rest of player block (score + gif)
// add transitions
// win condition based on all cards won
// on game end reset, img to castle etc
// sounds
// more bosses
// more game mechanics
// make it more responsive