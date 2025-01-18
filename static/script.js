let scene, camera, renderer, hangmanGroup, light;

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    renderer.setClearColor(0x87CEEB); // Couleur de ciel
    document.getElementById('hangman-container').appendChild(renderer.domElement);

    camera.position.z = 5;
    camera.position.y = 1;

    hangmanGroup = new THREE.Group();
    scene.add(hangmanGroup);

    // Ajout d'une lumière ambiante
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Ajout d'une lumière directionnelle
    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Création du sol
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x556B2F });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    scene.add(ground);

    // Création de la potence
    createGallows();

    animate();
}

function createGallows() {
    const woodMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

    // Poteau vertical
    const poleGeometry = new THREE.BoxGeometry(0.2, 4, 0.2);
    const pole = new THREE.Mesh(poleGeometry, woodMaterial);
    pole.position.set(-1.5, 0, 0);
    hangmanGroup.add(pole);

    // Barre horizontale
    const beamGeometry = new THREE.BoxGeometry(3, 0.2, 0.2);
    const beam = new THREE.Mesh(beamGeometry, woodMaterial);
    beam.position.set(0, 1.9, 0);
    hangmanGroup.add(beam);

    // Support diagonal
    const supportGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    const support = new THREE.Mesh(supportGeometry, woodMaterial);
    support.position.set(-1.2, 0.5, 0);
    support.rotation.z = Math.PI / 4;
    hangmanGroup.add(support);
}

function createHead() {
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE4B5 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(1.5, 1.2, 0);
    return head;
}

function createBody() {
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x1E90FF });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(1.5, 0.3, 0);
    return body;
}

function createLimb(isArm) {
    const limbGeometry = new THREE.CylinderGeometry(0.08, 0.08, isArm ? 0.7 : 0.8, 32);
    const limbMaterial = new THREE.MeshLambertMaterial({ color: isArm ? 0x1E90FF : 0x4169E1 });
    const limb = new THREE.Mesh(limbGeometry, limbMaterial);
    return limb;
}

function updateHangman(mistakes) {
    // Supprimer les parties du corps existantes
    while (hangmanGroup.children.length > 4) { // 4 pour les éléments de la potence
        hangmanGroup.remove(hangmanGroup.children[hangmanGroup.children.length - 1]);
    }

    if (mistakes > 0) {
        const head = createHead();
        hangmanGroup.add(head);
    }
    if (mistakes > 1) {
        const body = createBody();
        hangmanGroup.add(body);
    }
    if (mistakes > 2) {
        const leftArm = createLimb(true);
        leftArm.position.set(1.2, 0.5, 0);
        leftArm.rotation.z = Math.PI / 2;
        hangmanGroup.add(leftArm);
    }
    if (mistakes > 3) {
        const rightArm = createLimb(true);
        rightArm.position.set(1.8, 0.5, 0);
        rightArm.rotation.z = -Math.PI / 2;
        hangmanGroup.add(rightArm);
    }
    if (mistakes > 4) {
        const leftLeg = createLimb(false);
        leftLeg.position.set(1.3, -0.5, 0);
        leftLeg.rotation.z = Math.PI / 12;
        hangmanGroup.add(leftLeg);
    }
    if (mistakes > 5) {
        const rightLeg = createLimb(false);
        rightLeg.position.set(1.7, -0.5, 0);
        rightLeg.rotation.z = -Math.PI / 12;
        hangmanGroup.add(rightLeg);
    }
}

function resetHangman() {
    // Supprimer toutes les parties du corps sauf la potence
    while (hangmanGroup.children.length > 4) { // 4 pour les éléments de la potence
        hangmanGroup.remove(hangmanGroup.children[hangmanGroup.children.length - 1]);
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Animation simple : rotation du pendu
    if (hangmanGroup) {
        hangmanGroup.rotation.y += 0.005;
    }

    // Animation de la lumière
    const time = Date.now() * 0.001;
    light.position.x = Math.sin(time) * 5;
    light.position.z = Math.cos(time) * 5;

    renderer.render(scene, camera);
}

function winAnimation() {
    const duration = 3000; // Animation duration in milliseconds
    const startTime = Date.now();

    function animate() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Make the hangman "dance"
        hangmanGroup.position.y = Math.sin(progress * Math.PI * 8) * 0.2;
        hangmanGroup.rotation.y = Math.sin(progress * Math.PI * 4) * 0.5;

        // Change background color
        const hue = 120 * progress; // Green hue
        renderer.setClearColor(new THREE.Color(`hsl(${hue}, 100%, 50%)`));

        renderer.render(scene, camera);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Reset after animation
            hangmanGroup.position.y = 0;
            hangmanGroup.rotation.y = 0;
            renderer.setClearColor(0x87CEEB);
        }
    }

    animate();
}

function loseAnimation() {
    const duration = 3000; // Animation duration in milliseconds
    const startTime = Date.now();
    const tearGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const tearMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEFA });
    const tears = [];

    // Create tears
    for (let i = 0; i < 2; i++) {
        const tear = new THREE.Mesh(tearGeometry, tearMaterial);
        tear.position.set(1.5 + (i * 0.2 - 0.1), 1.2, 0.3);
        hangmanGroup.add(tear);
        tears.push(tear);
    }

    function animate() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Make the hangman "cry"
        hangmanGroup.rotation.z = Math.sin(progress * Math.PI * 2) * 0.1;

        // Animate tears
        tears.forEach((tear, index) => {
            tear.position.y = 1.2 - progress * 1.5 - index * 0.2;
            tear.position.x = 1.5 + Math.sin(progress * Math.PI * 4 + index * Math.PI) * 0.1;
        });

        // Change background color
        const hue = 0; // Red hue
        const lightness = 50 - 20 * progress; // Darken the background
        renderer.setClearColor(new THREE.Color(`hsl(${hue}, 100%, ${lightness}%)`));

        renderer.render(scene, camera);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Reset after animation
            hangmanGroup.rotation.z = 0;
            tears.forEach(tear => hangmanGroup.remove(tear));
            renderer.setClearColor(0x87CEEB);
        }
    }

    animate();
}

document.addEventListener('DOMContentLoaded', () => {
    const wordContainer = document.getElementById('word-container');
    const hintContainer = document.getElementById('hint-container');
    const keyboardContainer = document.getElementById('keyboard');
    const newGameBtn = document.getElementById('new-game-btn');
    const helpBtn = document.getElementById('help-btn');
    const helpText = document.getElementById('help-text');

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let gameState = {};

    initThreeJS();

    // Ajouter un écouteur d'événements clavier
    document.addEventListener('keydown', handleKeyPress);

    // Fonction pour gérer les touches pressées
    function handleKeyPress(event) {
        const key = event.key.toUpperCase(); // Convertir en majuscule
        if (/^[A-Z]$/.test(key)) { // Vérifier si la touche est une lettre de A à Z
            guessLetter(key);
        }
    }

    // Désactiver le clavier
    function disableKeyboard() {
        document.removeEventListener('keydown', handleKeyPress);
    }

    function createKeyboard() {
        keyboardContainer.innerHTML = '';
        alphabet.split('').forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.addEventListener('click', () => guessLetter(letter));
            keyboardContainer.appendChild(button);
        });
    }

    function updateGameDisplay() {
        wordContainer.textContent = gameState.word_state.toUpperCase();
        hintContainer.textContent = `Indice : ${gameState.hint || 'Pas d\'indice disponible'}`;
        updateHangman(6 - gameState.remaining_attempts);
    }

    function disableAllButtons() {
        keyboardContainer.querySelectorAll('button').forEach(button => {
            button.disabled = true;
        });
    }

    async function guessLetter(letter) {
        const response = await fetch('/guess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ letter: letter.toLowerCase() }),
        });
        gameState = await response.json();
        console.log(gameState); // Pour déboguer
        updateGameDisplay();

        if (gameState.game_over) {
            disableAllButtons();
            disableKeyboard(); // Désactiver le clavier
            if (gameState.win) {
                winAnimation();
                setTimeout(() => {
                    alert('Félicitations ! Vous avez gagné !');
                    startNewGame(); // Démarrer une nouvelle partie après 2 secondes
                }, 2000);
            } else {
                loseAnimation();
                setTimeout(() => {
                    alert('Dommage, vous avez perdu. Le mot était : ' + gameState.word);
                    startNewGame(); // Démarrer une nouvelle partie après 2 secondes
                }, 2000);
            }
        }
    }

    async function startNewGame() {
        const response = await fetch('/new-game', { method: 'POST' });
        gameState = await response.json();
        updateGameDisplay();
        createKeyboard();
        helpText.textContent = '';
        resetHangman(); // Réinitialiser le bonhomme
        document.addEventListener('keydown', handleKeyPress); // Réactiver le clavier
    }

    async function getHelp() {
        helpBtn.disabled = true;
        helpBtn.textContent = 'Chargement...';

        const response = await fetch('/get-help', { method: 'POST' });
        const data = await response.json();

        helpText.textContent = data.help_text;
        helpBtn.disabled = false;
        helpBtn.textContent = 'Demander de l\'aide';
    }

    newGameBtn.addEventListener('click', startNewGame);
    helpBtn.addEventListener('click', getHelp);
    startNewGame();
});