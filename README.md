Componenti riutilizzabili di questo sito:
* Header
* PhotoCard
* VideoPlayer
* Layout di Galleria
* Footer
* Hero sections

TODO:
* Riscrivere Header.astro in modo che sia riutilizzabile e con CSS scoped
* Riscrivere delle PhotoCard indipendenti di cui si possano specificare le dimensioni ma senza fuckuppare il layout
* Scrivere dei Layout di galleria in modo che si possa scegliere come visualizzare PhotoCard e video
* Scrivere il footer in modo indipendente e CSS scoped
* Riscrivere le hero sections in modo che abbiano il layout pronto e si possano usare semplicemente così:
  <Hero image={imagePath} title={title} paragraph={paragraph} cta={ctaButton}>
