const main = {
    page: document.querySelector(".main-menu"),
    goal: document.querySelector(".main-menu >p"),
    playerNameInput: document.querySelector(".main-menu >input"),
    startGameButton: document.querySelector(".main-menu >button"),
	difficulty: {
		"1": document.querySelector(".main-menu >div >button:nth-of-type(1)"),
		"2": document.querySelector(".main-menu >div >button:nth-of-type(2)"),
		"3": document.querySelector(".main-menu >div >button:nth-of-type(3)"),
		"4": document.querySelector(".main-menu >div >button:nth-of-type(4)")
	}
};
const game = {
    page: document.querySelector(".game-menu"),
    blackscreen: document.querySelector("body >div:first-of-type"),
	endGame: {
		page: document.querySelector("body >div:nth-of-type(4)"),
		header: document.querySelector("body >div:nth-of-type(4) >div >h1"),
		paragraph: document.querySelector("body >div:nth-of-type(4) >div >p"),
		mainMenu: document.querySelector("body >div:nth-of-type(4) >div >div >button:first-of-type"),
		tryAgain: document.querySelector("body >div:nth-of-type(4) >div >div >button:last-of-type")
	},
    result: {
		page: document.querySelector("body >div:nth-of-type(2)"),
		text: document.querySelector("body >div:nth-of-type(2) >div >p"),
		chips: document.querySelector("body >div:nth-of-type(2) >div >div"),
		button: document.querySelector("body >div:nth-of-type(2) >div >button")
	},
	ace: {
		page: document.querySelector("body >div:nth-of-type(3)"),
		card: document.querySelector("body >div:nth-of-type(3) >div >img")
	},
    placeBet: {
        page: document.querySelector(".game-menu >div >div:first-of-type"),
        input: document.querySelector(".game-menu >div >div:first-of-type >div >input"),
        button: document.querySelector(".game-menu >div >div:first-of-type >div >div >button:first-of-type"),
        buttonMax: document.querySelector(".game-menu >div >div:first-of-type >div >div >button:nth-of-type(2)"),
        chips: document.querySelector(".game-menu >div >div:first-of-type >div >h2"),
        chipDiv: document.querySelector(".game-menu >div >div:first-of-type >div >div:nth-of-type(2)")
    },
    playerName: document.querySelector(".game-menu >div >div:last-of-type >div >div:first-of-type >h1"),
    chips: document.querySelector(".game-menu >div >div:last-of-type >div >div:first-of-type >h2:first-of-type"),
    bet: document.querySelector(".game-menu >div >div:last-of-type >div >div:first-of-type >h2:last-of-type"),
    chipsDiv: document.querySelector(".game-menu >div >div:last-of-type >div >div:first-of-type >div:first-of-type"),
    cardsPlayer: document.querySelector(".player-cards-div"),
    totalPlayer: document.querySelector(".game-menu >div >div:last-of-type >div >div:first-of-type >h3"),
	cardsDealer: document.querySelector(".game-menu >div >div:last-of-type >div >div:last-of-type >div:first-of-type"),
    totalDealer: document.querySelector(".game-menu >div >div:last-of-type >div >div:last-of-type >h3"),
    cardDeck: document.querySelector(".game-menu >div >div:last-of-type >div >img"),
    buttons: {
		stay: document.querySelector(".game-menu >div >div:last-of-type >div >div:first-of-type >div:last-of-type >button:last-of-type"),
		hit: document.querySelector(".game-menu >div >div:last-of-type >div >div:first-of-type >div:last-of-type >button:first-of-type")
	},
    player: {},
    dealer: {},
	pause: false
};

let cardDeck = {};
let difficulty = 25;
let defaultCardSpeed = 500;

// resetPlayer("Oliver");
// resetDealer();
// showBetPage();

addListeners();
newCardDeck();

async function endGame(state=0) {
	game.pause = true;
	game.blackscreen.hidden = false;
	game.endGame.page.hidden = false;
	game.result.page.hidden = true;

	if (state === 0) {
		game.endGame.header.textContent = "Desværre! Du tabte";
		game.endGame.header.style.color = "red";
		game.endGame.paragraph.textContent = "Du mistede alle dine penge";
		game.endGame.tryAgain.textContent = "PRØV IGEN";
	} else {
		game.endGame.header.textContent = "Tillykke! Du vandt";
		game.endGame.header.style.color = "lightgreen";
		game.endGame.paragraph.textContent = "Du nåede $" + difficulty * 10;
		game.endGame.tryAgain.textContent = "SPIL IGEN";
	}

	bounceAnimation(game.endGame.page);
	await sleep(600);
	game.pause = false;
}

function setDifficulty(index, value, color) {
	difficulty = value;
	for (let i = 1; i < 5; i++) {
		if (i === index) continue;
		main.difficulty[i].style.background = "gray";
	}
	main.difficulty[index].style.background = color
	if (value != null) {
		main.goal.textContent = "Start med 10 chips, hver værd $10, nå $" + difficulty * 10 + " for at vinde.";
	} else main.goal.textContent = "Start med 10 chips, hver værd $10, få så mange penge som muligt."
}

function playAgain() {
	if (game.pause) return;
	game.endGame.page.hidden = true;
	resetPlayer(game.player.name);
	resetDealer();
	newCardDeck();
	resetRound();
	game.pause = false;
}

function mainMenu() {
	if (game.pause) return;
	resetRound();
	game.page.hidden = true;
	game.endGame.page.hidden = true;
	game.blackscreen.hidden = true;
	game.result.page.hidden = true;
	main.playerNameInput.value = "";
	main.startGameButton.disabled = true;
	main.page.hidden = false;
	resetDealer();
	newCardDeck();
	game.pause = false;
}

async function finishRound(result) {
	game.blackscreen.hidden = false;
	game.result.page.hidden = false;

	let state = result;
	if (state == undefined) state = (game.player.cardTotal > 21 ? 0 : game.player.cardTotal) > (game.dealer.cardTotal > 21 ? 0 : game.dealer.cardTotal) ? 1 : (game.player.cardTotal > 21 ? 0 : game.player.cardTotal) === (game.dealer.cardTotal > 21 ? 0 : game.dealer.cardTotal) ? 2 : 0;

	console.log(game.player.hasBlackjack);

	let multiplier = game.player.hasBlackjack ? 0.5 : 0;

	let reward = game.player.bet * 2 + Math.floor(game.player.bet * multiplier);

	if (state === 0) {
		game.result.text.style.color = "red";
		game.result.text.textContent = "- $" + reward / 2 * 10;
		showChips(game.result.chips, reward / 2, 1);
	} else if (state === 1) {
		game.result.text.style.color = "lightgreen";
		game.result.text.textContent = "+ $" + reward * 10;
		showChips(game.result.chips, reward);
		game.player.chips += reward;
	} else {
		game.result.text.style.color = "orange";
		game.result.text.textContent = "+ $0";
		game.player.chips += game.player.bet;
		showChips(game.result.chips, 0);
	}
	updateChips(game.player.chips);
	bounceAnimation(game.result.page);
	await sleep(600);
	game.pause = false;
}

function nextRound() {
	if (game.pause) return;
	if (difficulty != null) {
		if (game.player.chips >= difficulty) {
			endGame(1);
			return;
		}
	}
	if (game.player.chips < 1) {
		endGame(0);
		return;
	}
	resetRound();
}

function resetRound() {
	if (game.pause) return;
	game.buttons.hit.hidden = true;
	game.buttons.stay.hidden = true;
	game.player.cards = [];
	game.player.aces = [];
	game.player.cardTotal = 0;
	game.player.bet = 0;
	game.player.hasBlackjack = false;
	game.dealer.cards = [];
	game.dealer.aces = [];
	game.dealer.cardTotal = 0;
	setTotal(game.totalDealer, 0);
	setTotal(game.totalPlayer, 0);
	game.totalDealer.hidden = true;
	game.totalPlayer.hidden = true;
	while (game.cardsDealer.lastChild) {
		game.cardsDealer.removeChild(game.cardsDealer.lastChild);
	}
	while (game.cardsPlayer.lastChild || game.chipsDiv.lastChild) {
		if (game.cardsPlayer.lastChild) game.cardsPlayer.removeChild(game.cardsPlayer.lastChild);
		if (game.chipsDiv.lastChild) game.chipsDiv.removeChild(game.chipsDiv.lastChild);
	}
	updateBet(0);
	newCardDeck();
	game.result.page.hidden = true;
	showBetPage();
}

function newCardDeck() {
	cardDeck = {
		used: [],
		getRandomCard() {
			untilDone: while (true) {
				if (this.used.length > 51) return null;
				let random = Math.floor(Math.random() * 13) + 1
				let randomType = Math.floor(Math.random() * 4);
				for (let i = 0; i < this.used.length; i++) {
					if (this.used[i][0] === random && this.used[i][1] === randomType) continue untilDone;
				}
				return [random, randomType];
			}
		},
		useCard(card) {
			this.used.push(card);
		}
	}
}

function addListeners() {
    main.playerNameInput.addEventListener("input", () => {
        if (main.playerNameInput.value.length > 0 && main.startGameButton.disabled) {
            main.startGameButton.disabled = false;
        } else if (main.playerNameInput.value.length < 1 && !main.startGameButton.disabled) {
            main.startGameButton.disabled = true;
        }
    });
    game.placeBet.input.addEventListener("input", () => {
        let value = Number.parseInt(game.placeBet.input.value);
        if (game.placeBet.input.value.length == 0 || (value.toString() == game.placeBet.input.value && value <= game.player.chips && value > 0)) {
            if (!game.placeBet.button.disabled) return;
            game.placeBet.button.disabled = false;
        } else if (!game.placeBet.button.disabled) {
            game.placeBet.button.disabled = true;
        }
    });
}

function maxBet() {
	game.placeBet.input.value = game.player.chips;
	game.placeBet.button.disabled = false;
}

async function placeBet() {
	if (game.pause) return;
	game.pause = true;
	let bet = game.placeBet.input.value.length === 0 ? 1 : Number.parseInt(game.placeBet.input.value);
    game.placeBet.page.hidden = true;
	game.blackscreen.hidden = true;
    game.player.bet = bet
	game.player.chips -= bet;
	game.placeBet.input.value = "";
	updateBet(game.player.bet);
	updateChips(game.player.chips);
	showChips(game.chipsDiv, game.player.bet);
	// throwCards(game.cardsPlayer, false, 500, [1,0]);
	throwCards(game.cardsPlayer);
	throwCards(game.cardsDealer);
	await sleep(100);
	// throwCards(game.cardsPlayer, false, 500, [10,0]);
	throwCards(game.cardsPlayer);
	throwCards(game.cardsDealer, true);
	await sleep(defaultCardSpeed + 100);
	game.pause = false;
	if (game.player.aces.length > 0) {
		if (game.player.cardTotal !== 10) {
			ace();
		} else {
			game.player.cardTotal += 11;
			setTotal(game.totalPlayer, game.player.cardTotal);
			game.player.aces = [];
			if (game.player.cards.length < 3) game.player.hasBlackjack = true;
		}
	}
	if (game.player.cardTotal === 21) {
		stay();
	}
}

async function ace(alreadyOpen) {
	if (!alreadyOpen) game.pause = true;
	game.blackscreen.hidden = false;
	game.ace.page.hidden = false;
	game.ace.card.src = getCardPng(game.player.aces[game.player.aces.length - 1]);
	if (!alreadyOpen) {
		bounceAnimation(game.ace.page);
		await sleep(600);
		game.pause = false;
	}
}

function chooseAce(num) {
	if (game.pause) return;
	game.player.cardTotal += num;
	setTotal(game.totalPlayer, game.player.cardTotal);
	game.player.aces.pop();
	if (game.player.aces.length > 0) {
		ace(true);
	} else {
		game.blackscreen.hidden = true;
		game.pause = false;
		game.ace.page.hidden = true;
		if (game.player.cardTotal === 21) {
			stay();
		}
		if (game.player.cardTotal > 21) finishRound();
	}
}

function getOffset(el, el2) {
  const rect = el.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return {
    left: (rect.left + window.scrollX) - (rect2.left + window.scrollX),
    top: (rect.top + window.scrollY) - (rect2.top + window.scrollY)
  };
}

async function throwCards(player, hidden, speed=defaultCardSpeed, forceCard) {
	const card = document.createElement("img");
	card.hidden = "until-found";
	card.src = "images/1.png";
	let randomCard = cardDeck.getRandomCard();
	if (forceCard) randomCard = forceCard;
	cardDeck.useCard(randomCard);

	player.appendChild(card);
	if (player === game.cardsPlayer) {
		game.player.cards.push(randomCard);
		if (randomCard[0] === 1 && game.player.cardTotal + 11 < 22) game.player.aces.push(randomCard);
	} else {
		game.dealer.cards.push(randomCard);
		if (randomCard[0] === 1) game.dealer.aces.push(randomCard);
	}

	setTimeout(async function() {
		if (!hidden) {
			let offset = getOffset(card, game.cardDeck);
			card.animate([
				{transform: "translateX(" + offset.left * -1 + "px) translateY(" + offset.top * -1 + "px) rotateY(180deg)"},
				// {transform: "translateX(" + offset.left * -1 / 2 + "px) translateY(" + offset.top * -1 / 2 + "px) rotateY(90deg)"}
				{transform: "translateX(0) translateY(0) rotateY(0)"}
			], speed);
			card.hidden = false;
			await sleep(speed / 2);
			card.src = getCardPng(randomCard);
			// card.animate([
			// 	{transform: "translateX(" + offset.left * -1 / 2 + "px) translateY(" + offset.top * -1 / 2 + "px) rotateY(90deg)"},
			// 	{transform: "translateX(0) translateY(0) rotateY(0)"}
			// ], speed);
			await sleep(speed / 2);
			if (player === game.cardsPlayer) {
				if (getCardValue(randomCard[0]).length < 2 || (getCardValue(randomCard[0]).length > 1 && game.player.cardTotal + 11 > 21)) {
					game.player.cardTotal += getCardValue(randomCard[0])[0];
					setTotal(game.totalPlayer, game.player.cardTotal);
				}
			} else {
				let dealerAdd = getCardValue(randomCard[0])[0];
				if (getCardValue(randomCard[0]).length > 1) {
					if (game.dealer.cardTotal + 11 > 21) {
						dealerAdd = 1;
					} else if (game.dealer.cardTotal + 11 === 21) {
						dealerAdd = 11;
					} else if (game.dealer.cardTotal + 11 > 17) {
						dealerAdd = 11;
					} else if (game.dealer.cardTotal + 11 > 11 && game.dealer.cardTotal + 11 < 17) {
						dealerAdd = 1;
					} else dealerAdd = 11;
				}
				game.dealer.cardTotal += dealerAdd;
				setTotal(game.totalDealer, game.dealer.cardTotal);
			}
			if (player === game.cardsPlayer) {
				if (game.totalPlayer.hidden) game.totalPlayer.hidden = false;
				if (game.buttons.stay.hidden) game.buttons.stay.hidden = false;
				if (game.buttons.hit.hidden) game.buttons.hit.hidden = false;
			} else if (game.totalDealer.hidden) game.totalDealer.hidden = false;
		} else {
			let offset = getOffset(card, game.cardDeck);
			card.animate([
				{transform: "translateX(" + offset.left * -1 + "px) translateY(" + offset.top * -1 + "px)"},
				{transform: "translateX(0) translateY(0)"}
			], speed);
			card.hidden = false;
		}
	}, 10);
}

async function hit() {
	if (game.pause) return;
	game.pause = true;
	throwCards(game.cardsPlayer);
	await sleep(defaultCardSpeed + 100);
	game.pause = false;
	if (game.player.cardTotal > 21) {
		finishRound()
	} else if (game.player.cardTotal === 21) {
		stay();
	} else if (game.player.aces.length > 0) ace();
}

async function stay() {
	if (game.pause) return;
	game.pause = true;
	game.buttons.stay.hidden = true;
	game.buttons.hit.hidden = true;
	await sleep(1000);
	let cardFlip = game.cardsDealer.lastChild;
	cardFlip.animate([
		{transform: "rotateY(180deg)"},
		{transform: "rotateY(90deg)"}
	], 100);
	cardFlip.src = getCardPng(game.dealer.cards[1]);
	cardFlip.animate([
		{transform: "rotateY(90deg)"},
		{transform: "rotateY(0)"}
	], 100);
	let dealerAdd = getCardValue(game.dealer.cards[1][0])[0];
	if (getCardValue(game.dealer.cards[1][0]).length > 1) {
		if (game.dealer.cardTotal + 11 > 21) {
			dealerAdd = 1;
		} else if (game.dealer.cardTotal + 11 === 21) {
			dealerAdd = 11;
		} else if (game.dealer.cardTotal + 11 > 17) {
			dealerAdd = 11;
		} else if (game.dealer.cardTotal + 11 > 11 && game.dealer.cardTotal + 11 < 17) {
			dealerAdd = 1;
		} else dealerAdd = 11;
	}
	game.dealer.cardTotal += dealerAdd;
	setTotal(game.totalDealer, game.dealer.cardTotal);
	await sleep(1250);
	while (game.dealer.cardTotal < 16 && game.player.cardTotal >= game.dealer.cardTotal) {
		throwCards(game.cardsDealer, false, 450);
		await sleep(1250);
	}
	finishRound();
}

function setTotal(player, total) {
	player.textContent = "Total: " + total;
}

function getCardValue(card) {
	if (card === 1) {
		return [1, 11];
	} else if (card > 9) {
		return [10]
	} else return [card];
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function startGame() {
	if (game.pause) return;
	if (main.startGameButton.disabled) return;
	main.page.hidden = true;
	game.page.hidden = false;
	newCardDeck();
	resetPlayer(main.playerNameInput.value);
	resetDealer();
	showBetPage();
}

function showBetPage() {
	game.placeBet.page.hidden = false;
	game.blackscreen.hidden = false;
	game.placeBet.input.focus();
	showChips(game.placeBet.chipDiv, game.player.chips);
}

function showChips(container, chips, type=0) {
	while (container.lastChild) {
		container.removeChild(container.lastChild);
	}
	let maxDivs = Math.ceil(chips / 5)
	for (let divs = 0; divs < maxDivs; divs++) {
		if (divs < 10) {
			const chipImg = document.createElement("img");
			let chipStack = chips > 4 ? 5 : chips;
			chipImg.src = "images/" + type +"-chips-" + chipStack + ".png";
			chips -= chipStack;

			container.appendChild(chipImg);
		} else {
			const chipImg = document.createElement("p");
			chipImg.className = "game-info-styling";
			chipImg.style.fontSize = "1.875rem";
			chipImg.textContent = "+ " + chips + " flere";

			container.appendChild(chipImg);
			return;
		}
	}
}

function resetPlayer(name) {
    game.player = {
        name: name,
        chips: 10,
        bet: 0,
		cardTotal: 0,
		cards: [],
		aces: [],
		hasBlackjack: false
    };
    game.playerName.textContent = game.player.name;
	updateBet(game.player.bet);
	updateChips(game.player.chips);
}

function resetDealer() {
	game.dealer = {
		cardTotal: 0,
		cards: [],
		aces: []
	};
}

function getCardPng(card) {
	return "images/" + card[0] + "-" + card[1] + ".png";
}

function updateChips(chips) {
    game.chips.textContent = "Chips: " + chips + " ($" + chips * 10 + ")";
	game.placeBet.chips.textContent = "Dine chips: " + chips;
}

function updateBet(bet) {
	game.bet.textContent = "Bet: " + bet + " chip" + (bet === 1 ? "" : "s");
}

function bounceAnimation(container) {
	for (let child of container.children) {
		child.animate([
			{transform: "translateY(3.125rem)", opacity: "0"},
			{transform: "translateY(0)", opacty: "1"}
		], 500);
	}
}