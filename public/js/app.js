import axios from "axios";
import Swal from "sweetalert2";
import routes from "../../routes/routes";

document.addEventListener("DOMContentLoaded", () => {
  const skills = document.querySelector(".lista-conocimientos");

  // clean alerts
  const alerts = document.querySelector(".alertas");
  if (alerts) {
    cleanAlerts();
  }

  if (skills) {
    skills.addEventListener("click", addSkills);

    selectedSkills();
  }

  const openPositionList = document.querySelector(".panel-administracion");

  if (openPositionList) {
    openPositionList.addEventListener("click", listActions);
  }
});

const skills = new Set();

const addSkills = (e) => {
  if (e.target.tagName === "LI") {
    const skill = e.target.textContent;
    if (e.target.classList.contains("activo")) {
      skills.delete(skill);
      e.target.classList.remove("activo");
    } else {
      skills.add(skill);
      e.target.classList.add("activo");
    }
    document.querySelector("#skills").value = [...skills];
  }
};

const selectedSkills = () => {
  const selected = Array.from(
    document.querySelectorAll(".lista-conocimientos .activo")
  );

  selected.forEach((item) => {
    skills.add(item.textContent);
  });

  document.querySelector("#skills").value = [...skills];
};

const cleanAlerts = () => {
  const alerts = document.querySelector(".alertas");
  const interval = setInterval(() => {
    if (alerts.children && alerts.children.length > 0) {
      alerts.removeChild(alerts.children[0]);
    } else if (alerts.children && alerts.children.length === 0) {
      alerts.parentElement.removeChild(alerts);
      clearInterval(interval);
    }
  }, 2000);
};

const listActions = (e) => {
  e.preventDefault();
  if (e.target.dataset.delete) {
    Swal.fire({
      title: "Delete Open Position",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `${location.origin}${routes.DELETE_OPEN_POSITION}/${e.target.dataset.delete}`;
        axios
          .delete(url, { params: { url } })
          .then((response) => {
            if (response.status === 200) {
              Swal.fire("Deleted!", response.data, "success");

              e.target.parentElement.parentElement.parentElement.removeChild(
                e.target.parentElement.parentElement
              );
            }
          })
          .catch(() => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "There was an error trying to delete.",
            });
          });
      }
    });
  } else if (e.target.href) {
    window.location.href = e.target.href;
  }
};
