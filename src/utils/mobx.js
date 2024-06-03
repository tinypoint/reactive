import { autorun, computed, observable } from 'mobx';

var a = observable({
  name: 'a',
});

var b = computed(() => {
  return a.name + 1;
})

var dis = autorun(() => {
  console.log(b.get());
  console.log('执行');
});

setTimeout(() => {
  a.name = 'b';
  // dis();
}, 500);

setTimeout(() => {
  a.name = 'c';
}, 500);
