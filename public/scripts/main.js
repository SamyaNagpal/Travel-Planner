let nav = document.querySelector('nav');

window.addEventListener('scroll', () =>{
    if(window.scrollY > 100){
        nav.classList.add('sticky_nav');
    }
    else{
        nav.classList.remove('sticky_nav');
    }
});