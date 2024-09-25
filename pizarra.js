const sum = (a, b) => {
    if (a && b) {
      return a + b;
    }
    throw new Error('Argumentos invalidos');
  };
  
  try {
    console.log(sum(1));
  } catch (error) {
    console.log('Un Error ocurrio');
  //   console.log(error);
  }
  
  // console.log(sum(1));
  console.log('Esto funciona');
  