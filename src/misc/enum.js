export default function Enum(names) {
  var enums = {};
  names.forEach(name => (enums[name] = name));
  return enums;
}
