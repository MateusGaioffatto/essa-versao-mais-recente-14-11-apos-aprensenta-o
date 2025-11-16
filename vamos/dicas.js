   // Dados do quiz - 11 perguntas
    const quizQuestions = [
      {
        question: "O que você deve fazer ao receber um email pedindo sua senha do banco?",
        options: [
          "Responder com a senha",
          "Clicar no link do email",
          "Ignorar e deletar o email",
          "Encaminhar para amigos"
        ],
        correct: 2
      },
      {
        question: "Qual destes é um exemplo de senha mais segura?",
        options: [
          "123456",
          "senha123",
          "Maria2024!",
          "01011990"
        ],
        correct: 2
      },
      {
        question: "O que o HTTPS indica em um site?",
        options: [
          "Que o site é mais rápido",
          "Que a conexão é criptografada",
          "Que o site é gratuito",
          "Que o site tem mais recursos"
        ],
        correct: 1
      },
      {
        question: "O que é phishing?",
        options: [
          "Um tipo de pescaria online",
          "Uma técnica de golpe para obter dados pessoais",
          "Um método de compra online",
          "Um tipo de vírus de computador"
        ],
        correct: 1
      },
      {
        question: "Por que é importante manter software atualizado?",
        options: [
          "Para ter os recursos mais recentes",
          "Para corrigir vulnerabilidades de segurança",
          "Para melhorar a velocidade do computador",
          "Para liberar mais espaço em disco"
        ],
        correct: 1
      },
    ];




    
    let currentQuestion = 0;
    let userAnswers = new Array(quizQuestions.length).fill(null);

    function flipCard(card) {
      card.classList.toggle('flipped');
    }

    function loadQuestion() {
      const question = quizQuestions[currentQuestion];
      document.getElementById('quizQuestion').textContent = question.question;
      
      const optionsContainer = document.getElementById('quizOptions');
      optionsContainer.innerHTML = '';
      
      question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'quiz-option';
        optionElement.textContent = option;
        optionElement.onclick = function() {
          checkAnswer(this, index === question.correct);
        };
        optionsContainer.appendChild(optionElement);
      });
      
      document.getElementById('quizProgress').textContent = `Pergunta ${currentQuestion + 1} de ${quizQuestions.length}`;
      document.getElementById('prevBtn').disabled = currentQuestion === 0;
      document.getElementById('nextBtn').disabled = currentQuestion === quizQuestions.length - 1;
      
      // Restaurar resposta anterior se existir
      if (userAnswers[currentQuestion] !== null) {
        const options = optionsContainer.querySelectorAll('.quiz-option');
        if (userAnswers[currentQuestion] === quizQuestions[currentQuestion].correct) {
          options[userAnswers[currentQuestion]].style.background = '#28a745';
         
          options[userAnswers[currentQuestion]].style.color = 'white';
        } else {
          options[userAnswers[currentQuestion]].style.background = '#dc3545';
          options[userAnswers[currentQuestion]].style.color = 'white';
          options[quizQuestions[currentQuestion].correct].style.background = '#28a745';
          options[quizQuestions[currentQuestion].correct].style.color = 'white';
        }
      }
      
      document.getElementById('quizResult').className = 'quiz-result';
    }

    function checkAnswer(option, isCorrect) {
      const result = document.getElementById('quizResult');
      const options = option.parentElement.querySelectorAll('.quiz-option');
      const question = quizQuestions[currentQuestion];
      
      options.forEach(opt => {
        opt.style.pointerEvents = 'none';
      });
      
      options.forEach((opt, index) => {
        if (index === question.correct) {
          opt.style.background = '#28a745';
          opt.style.color = 'white';
          opt.style.borderColor = '#28a745';
        } else if (opt === option && !isCorrect) {
          opt.style.background = '#dc3545';
          opt.style.color = 'white';
          opt.style.borderColor = '#dc3545';
        }
      });
      
      // Salvar resposta do usuário
      userAnswers[currentQuestion] = Array.from(options).indexOf(option);
      
      if (isCorrect) {
        result.className = 'quiz-result result-correct show';
        result.innerHTML = '<i class="fas fa-check-circle"></i> Correto! Bancos nunca pedem senhas por email. Sempre ignore e delete essas mensagens.';
      } else {
        result.className = 'quiz-result result-incorrect show';
        result.innerHTML = '<i class="fas fa-times-circle"></i> Incorreto. Bancos nunca pedem senhas por email. A resposta correta é: Ignorar e deletar o email.';
      }
    }

    function nextQuestion() {
      if (currentQuestion < quizQuestions.length - 1) {
        currentQuestion++;
        loadQuestion();
      }
    }

    function prevQuestion() {
      if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
      }
    }

    // Inicializar o quiz
    loadQuestion();