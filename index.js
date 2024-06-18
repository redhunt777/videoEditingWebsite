const observer = new IntersectionObserver((entries =>{
    entries.forEach((entry)=>{
        if(entry.isIntersecting){
            entry.target.classList.add('show');
        }else{
            entry.target.classList.remove('show');
        }
    })
}))
const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el)=> observer.observe(el));

       
const form = document.getElementById('contactForm');

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    const body = `Customer Name:  ${name};   

    Customer Email:   ${email} (Click on the mail to chat with customer);

    Customer Message:    ${message}`;

    Email.send({
        Host : "smtp.elasticemail.com",
        Username : "sarthak613singh@gmail.com",
        Password : "15848CCE757683C9357DFA21AC22377CD216",
        To : "hypercosmic.edit@gmail.com",
        From : "sarthak613singh@gmail.com",
        Subject : "You have a new message from your website (Hyper Cosmic Edits) from "+ name,
        Body : body
    }).then(
        message => {
            alert('Message sent successfully');
            form.reset();
        },
        error => {
            alert('Failed to send message. Please try again later.');
        }
    );
});



