const deleteProducto = btn => {
  const idProducto = btn.parentNode.querySelector('[name=idProducto]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const elementoProducto = btn.closest('article');

  fetch('/admin/producto/' + idProducto, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      console.log(data);
      elementoProducto.parentNode.removeChild(elementoProducto);
    })
    .catch(err => {
      console.log(err);
    });
};
