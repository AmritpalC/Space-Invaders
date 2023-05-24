// ! ---- state variables & elements ----*/
const grid = document.querySelector('.grid')
const width = 15
const height = 12
const cellCount = width * height
let cells = []

const heroStartingPosition = 172
let heroCurrentPosition = heroStartingPosition
let allShields = [137, 138, 140, 141, 143, 144, 146, 147]

let alienPositions = [5, 6, 7, 8, 9, 10, 19, 20, 21, 22, 23, 24, 25, 26, 35, 36, 37, 38, 39, 40]
let alienMoveInterval 
let alienDirection = 'right'

const landingPage = document.getElementById("landing-page")
const gamePage = document.getElementById("game-page")
gamePage.style.visibility = 'hidden'

// ! ----Buttons: play, restart and mute ----*/
const playBtn = document.getElementById("play-btn")
const restartBtn = document.getElementById("restart-btn")
const musicBtn = document.getElementById("music-btn")

// !  ---- Music and sounds for missiles and hits and win ----*/
function toggleBgMusic() {
    const bgMusic = document.getElementById('bgMusic')
    bgMusic.volume = 0.9
    bgMusic.paused ? bgMusic.play() : bgMusic.pause()
}

const heroMissileSound = document.getElementById("heroMissileSound")
const alienMissileSound = document.getElementById("alienMissileSound")
const heroHitSound = document.getElementById("heroHitSound")
const alienHitSound = document.getElementById("alienHitSound")
const shieldHitSound = document.getElementById("shieldHitSound")
const playerWinsSound = document.getElementById("playerWinsSound")
const gameOverSound = document.getElementById("gameOverSound")

// ! ---- HUD - lives and score ----*/
let lives = 3
const playerLives = document.getElementById('lives')

let level = 1
const gameLevel = document.getElementById('level')

let score = 0
const playerScore = document.getElementById('score')

// ! ---- event listeners ----*/
playBtn.addEventListener('click', () => {
    landingPage.style.display = 'none'
    gamePage.style.visibility = 'visible'
    startGame()
})

musicBtn.addEventListener('click', toggleBgMusic)
restartBtn.addEventListener('click', function() {
    location.reload()
})

document.addEventListener('keydown', handleHeroMovememnt)
document.addEventListener('keydown', shootHeroMissile)

// ! ---- functions ----*/
function createGrid() {
    for (let i = 0; i < cellCount; i++) {
        const cell = document.createElement('div')
        cell.innertText = i
        cell.dataset.index = i
        cell.style.height = `${100 / height}%`
        cell.style.width = `${100 / width}%`
        grid.appendChild(cell)
        cells.push(cell)
    }
}

function startGame() {
    addHero(heroStartingPosition)
    addAliens(alienPositions)
    addShields(allShields)
    startAlienMovement()
    startAlienMissile()
}

function addHero(position) {
    cells[position].classList.add('hero')
}

function removeHero() {
    cells[heroCurrentPosition].classList.remove('hero')
}

function handleHeroMovememnt(event){
    removeHero()
    if (event.key === 'ArrowLeft' && heroCurrentPosition > cellCount - width) {
        heroCurrentPosition--
    } else if (event.key === 'ArrowRight' && heroCurrentPosition < cellCount - 1) {
        heroCurrentPosition++
    } else if (event.key !== ' ' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault()
    }
    addHero(heroCurrentPosition)
}

function addShields() {
    allShields.forEach(shield => {
        cells[shield].classList.add('shield')
    })
}

function addAliens() {
    alienPositions.forEach(alien => {
        cells[alien].classList.add('alien')
    })
}

function removeAliens() {
    alienPositions.forEach(alien => {
        cells[alien].classList.remove('alien')
    })
}

function startAlienMovement() {
    alienMoveInterval = setInterval(moveAliens, 500);
}  
  
function stopAlienMovement() {
    clearInterval(alienMoveInterval)
}

function moveAliens() {
    const aliensReachedWall = alienPositions.some(alien => 
        (alien % width === 0 && alienDirection === "left") || 
        ((alien + 1) % width === 0 && alienDirection === "right"))

    if (aliensReachedWall) {
        removeAliens()
        alienPositions = alienPositions.map(alien => alien + width)
        alienDirection = alienDirection === "left" ? "right" : "left"
        addAliens()
        gameOver()
        return
    }
    removeAliens()
    alienPositions = alienPositions.map(alien => alien + (alienDirection === "left" ? -1 : 1))
    addAliens()
}

function shootHeroMissile(event) {
    if (event.key === ' ') {
        event.preventDefault()
        heroMissileSound.playbackRate = 5
        heroMissileSound.volume = 0.4
        heroMissileSound.play()
        const heroMissile = document.createElement('div')
        let heroMissilePosition = heroCurrentPosition - width
        cells[heroMissilePosition].classList.add('heroMissile')

        const heroMissileInterval = setInterval(() => {
            cells[heroMissilePosition].classList.remove('heroMissile')
            heroMissilePosition -= width

            if (heroMissilePosition < 0) {
                clearInterval(heroMissileInterval)
            } else if (cells[heroMissilePosition].classList.contains('alien')) {
                clearInterval(heroMissileInterval)
                cells[heroMissilePosition].classList.remove('alien', 'heroMissile')
                alienPositions.splice(alienPositions.indexOf(heroMissilePosition), 1)
                score += 10
                alienHitSound.playbackRate = 3
                alienHitSound.play()
                playerScore.textContent = `Score: ${score}`
                playerWin()
            } else if (cells[heroMissilePosition].classList.contains('shield')) {
                clearInterval(heroMissileInterval)
                cells[heroMissilePosition].classList.remove('shield', 'heroMissile')
                allShields.splice(allShields.indexOf(heroMissilePosition), 1)
                shieldHitSound.volume = 0.5
                shieldHitSound.play()
            } else {
                cells[heroMissilePosition].classList.add('heroMissile')
            }
        }, 250)
    }
}

function startAlienMissile() {
    alienMissileFrequency = setInterval(shootAlienMissile, 1500);
}  
  
function stopAlienMissile() {
    clearInterval(alienMissileFrequency)
}

function shootAlienMissile() {
    if (alienPositions.length === 0) {
        stopAlienMissile()
        return
    }

    const lastAlien = alienPositions.slice(-1)
    const startOfBottowRowAliens = Math.floor(lastAlien / width) * width
    const bottomRowAliens = []

    for (let i = startOfBottowRowAliens; i <= lastAlien; i++) {
        if (cells[i].classList.contains('alien')) {
            bottomRowAliens.push(i)
        }
    }

    const rndIdxOfBottomRowAliens = Math.floor(Math.random() * bottomRowAliens.length)
    const rndAlienSelected = bottomRowAliens[rndIdxOfBottomRowAliens]

    const alienMissile = document.createElement('div')
    let alienMissilePosition = rndAlienSelected + width
    cells[alienMissilePosition].classList.add('alienMissile')
    alienMissileSound.volume = 0.2
    alienMissileSound.play()

    const alienMissileInterval = setInterval(() => {
        cells[alienMissilePosition].classList.remove('alienMissile')
        alienMissilePosition += width

        if (alienMissilePosition >= cellCount) {
            clearInterval(alienMissileInterval)
        } else if (cells[alienMissilePosition].classList.contains('hero')) {
            heroHitSound.playbackRate = 1.3
            heroHitSound.volume = 0.5
            heroHitSound.play()
            clearInterval(alienMissileInterval)
            lives--
            playerLives.textContent = `Lives: ${lives}`
            gameOver()
        } else if (cells[alienMissilePosition].classList.contains('shield')) {
            cells[alienMissilePosition].classList.remove('shield', 'alienMissile')
            allShields.splice(allShields.indexOf(alienMissilePosition), 1)
            shieldHitSound.volume = 0.5
            shieldHitSound.play()
            clearInterval(alienMissileInterval)
        } else {
            cells[alienMissilePosition].classList.add('alienMissile')
        }
    }, 250)
}

// ! ---- winning / losing functions ----*/
function playerWin() {
    if (alienPositions.length === 0) {
        stopAlienMovement()
        stopAlienMissile()
        const playerWinMessage = document.getElementById('player-win')
        playerWinMessage.textContent = `Kamehamehahahaha! You have stopped Frieza and his army of clones! Your score is ${score}!`
        gamePage.style.display = 'none'
        landingPage.style.display = 'block'
        document.getElementById('welcome').style.display = 'none'
        bgMusic.volume = 0.5
        playerWinsSound.volume = 0.5
        playerWinsSound.play()
    } else {
        return
    }
}

function gameOver() {
    let aliensReachedEarth = (alienPositions.some((alien) => (alien >= cellCount - width)))
    if ((aliensReachedEarth) || lives === 0) {
        stopAlienMovement()
        stopAlienMissile()
        removeHero()
        document.removeEventListener('keydown', shootHeroMissile)
        
        const gameOverMessage = document.getElementById('game-over')
        gameOverMessage.textContent = (aliensReachedEarth) ? `Game over! The aliens have invaded Earth! Your final score is ${score}!` : `Game over! You ran out of lives! Your final score is ${score}!`
        gamePage.style.display = 'none'
        landingPage.style.display = 'block'
        document.getElementById('welcome').style.display = 'none'
        document.getElementById('play-btn').style.display = 'none'
        bgMusic.volume = 0.5
        gameOverSound.play()
    } else {
        return
    }
}

// ! ---- Page load (initialise game) ----*/
createGrid()