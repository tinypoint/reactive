export const Comps = {
  input: (props) => {
    const { placeholder, value, name, setValue } = props;
    const onChange = (e) => {
      setValue(name, 'value', e.target.value);
    };
    return (
      <div>
        {placeholder}
        <input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    );
  },
  select: (props) => {
    const { placeholder, value, name, setValue } = props;
    const onChange = (e) => {
      setValue(name, 'value', e.target.value);
    };
    return (
      <div>
        {placeholder}
        <select
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        >
          <option>b</option>
          <option>c</option>
        </select>
      </div>
    );
  },
  button: (props) => {
    const { text, color, setValue } = props;
    return (
      <button
        style={{ color }}
        onClick={() => {
          setValue('input1', 'value', '0');
        }}
      >
        {text}
      </button>
    );
  },
};
