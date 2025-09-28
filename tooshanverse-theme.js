// === Tooshanverse Shared Particles ===
document.addEventListener("DOMContentLoaded", () => {
  const particleCount = 60; // تعداد ذرات
  for (let i = 0; i < particleCount; i++) {
    let particle = document.createElement("div");
    particle.classList.add("particle");
    document.body.appendChild(particle);

    // موقعیت و انیمیشن تصادفی
    let size = Math.random() * 4 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = `${Math.random() * 100}vh`;
    particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
  }
});
