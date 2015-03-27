var app = {

  init: function() {
    // retrieve from local storage
    var serializedHighScores = localStorage.getItem("highScores");
    app.game.highScores = JSON.parse(serializedHighScores);
    
    app.game.renderHighScores();
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
      app.player.redScore = 0;
      app.player.blueScore = 0;
      app.game.round = 0;
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
          var scoreIncrement = (50 - app.game.round) * app.game.guessesMade * (app.game.difficulty + 1);
          app.player[app.player.active+"Score"] += scoreIncrement;
          $('#' + app.player.active + '-score').html(app.player[app.player.active+"Score"]);
          if (app.slots.openSlot1) {app.slots[app.slots.openSlot1].won = true;}
          if (app.slots.openSlot2) {app.slots[app.slots.openSlot2].won = true;}
          if (app.slots.openSlot3) {app.slots[app.slots.openSlot3].won = true;}
          app.game.checkWin(app.player.active);
        }
        clearInterval(app.game.gameTimer);
        setTimeout(app.game.swapPlayer, app.game.difficultyTimer);
      }
    },
    guessRound: function() {
      app.game.round++;
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
    enableButtons: function() {
      $('#play').on('click', app.game.initGame);
      $('#difficulty').on('click', app.game.toggleDifficulty);
      $('#players').on('click', app.player.togglePlayers);
      $('button').toggleClass('inactive');
    },
    disableButtons: function() {
      $('#play').off('click', app.game.initGame);
      $('#difficulty').off('click', app.game.toggleDifficulty);
      $('#players').off('click', app.player.togglePlayers);
      $('button').toggleClass('inactive');
    },
    checkWin: function(player) {
      var win = true;
      for (var i = 0; i < 16; i++) {
        if (!app.slots[player + i].won) {
          win = false;
        }
      }
      if (win) {
        $('#boss').attr('src', "");
        $('.boss').html(('<br><br><br>' + player + ' player wins!').toUpperCase());
        app.game.checkHighScore(player);
        setTimeout(app.game.resetGame, 5000);
      }
    },
    checkHighScore: function(player) {
      var bossBlock = $('.boss');
      var bossText = bossBlock.html();
      for (var i = 1; i <= 4; i++) {
        if (app.player[player + 'Score'] > app.game.highScores[i][1]) {
          bossText += ('<br>' + player + ' player<br>new high score ' + i + ': ' + app.player[player + 'Score'] + '!').toUpperCase();
          bossBlock.html(bossText);
          app.game.newHighScore(i, app.player[player + 'Score']);
          break;
        }
      }
    },
    newHighScore: function(rank , score) {
      app.game.highScores[rank][0] = prompt("Enter your name! (max 8 chars)").slice(0, 8);
      app.game.highScores[rank][1] = score;

      // send to local storage
      var serializedHighScores = JSON.stringify(app.game.highScores);
      localStorage.setItem("highScores", serializedHighScores);
      
      app.game.renderHighScores();
    },
    renderHighScores: function() {
      for (var i = 1; i <=4; i++) {
        $('#score' + i).html(app.game.highScores[i][0]);
        $('#score-num' + i).html(app.game.highScores[i][1]);
      }
    },
    highScores: {
      1: ["(empty)", 0],
      2: ["(empty)", 0],
      3: ["(empty)", 0],
      4: ["(empty)", 0]
    },
    resetGame: function() {
      $('.boss').html('<img id="boss" src="images/castle.png"> alt=""');
      $('.hero-blue').setClass('inactive');
      $('.hero-red').setClass('inactive');
      app.player.active = "blue"
      app.game.enableButtons();
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
    blueScore: 0,
    redScore: 0,
    active: "blue"
  }
}

$(document).ready(app.init);


// check requirements
// readme
// add transitions & flips

// test reset
// ensure clicking already won card is caught
// ensure clicking first/2nd card when 3 set is caught

// fix high score prompt annoying
// refine 'damage'/score scenario
// player block gif on 'attack'
// improve timing of game diff
// think about game diff impacts
// add number to 2/3 cards

// improve local storage coverage
// use border gradients
// add faery/dragon name to card
// sounds
// more bosses
// more game mechanics
// make it more responsive
