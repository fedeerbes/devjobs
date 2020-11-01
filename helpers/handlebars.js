const routes = require("../routes/routes");

module.exports = {
  selectSkill: (selected = [], options) => {
    const skills = [
      "HTML5",
      "CSS3",
      "CSSGrid",
      "Flexbox",
      "JavaScript",
      "jQuery",
      "Node",
      "Angular",
      "VueJS",
      "ReactJS",
      "React Hooks",
      "Redux",
      "Apollo",
      "GraphQL",
      "TypeScript",
      "PHP",
      "Laravel",
      "Symfony",
      "Python",
      "Django",
      "ORM",
      "Sequelize",
      "Mongoose",
      "SQL",
      "MVC",
      "SASS",
      "WordPress",
    ];
    const html = skills.reduce(
      (html, skill) =>
        `${html} <li ${
          selected.includes(skill) ? ' class="activo"' : ""
        }>${skill}</li>`,
      ""
    );

    return (options.fn().html = html);
  },
  contractType: (selected, options) => {
    return options
      .fn(this)
      .replace(new RegExp(` value="${selected}"`), '$& selected="selected"');
  },
  showAlerts: (errors = {}, alerts) => {
    const category = Object.keys(errors);
    if (category.length) {
      const html = errors[category].reduce(
        (html, error) =>
          `${html} <div class="${category} alerta">${error}</div>`,
        ""
      );
      return (alerts.fn().html = html);
    }
  },
};
