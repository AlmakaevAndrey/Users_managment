const createUserForm = document.querySelector("[data-create-user-form]");
const usersContainer = document.querySelector("[data-users-container]");
const editUserFormDialog = document.querySelector("[data-edit-user-form-dialog]");

const MOCK_API_URL = "https://67cdcec9125cd5af7578db47.mockapi.io/Users";

let users = [];

// -------Клик по всему контейнеру (делегирование событий)  ------
usersContainer.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-user-remove-btn")) {
        const isRemoveUser = confirm("Вы точно хотите удалить этого красавчика!");
        isRemoveUser && removeExistingUsersAsync(e.target.dataset.userId);
        return;
    }

    if (e.target.hasAttribute("data-user-edit-btn")) {
        populateDialog(e.target.dataset.userId);

        editUserFormDialog.showModal();
    }
})

// ---- События отправки формы создания пользователя -----
createUserForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(createUserForm);
    const formUserData = Object.fromEntries(formData);

    const newUserData = {
        name: formUserData.userName,
        city: formUserData.userCity,
        email: formUserData.userEmail,
        avatar: formUserData.imagesUrlId,
    }

    createNewUsersAsync(newUserData)
})

// --------- Редактирование пользователя -------
const editExistingUsersAsync = async (newUserData) => {
    try {
        const response = await fetch(`${MOCK_API_URL}/${newUserData.id}`, {
            method: "PUT",
            body: JSON.stringify(newUserData),
            headers: {
                "Content-type": "application/json"
            }
        });

        if (response.status === 400) {
            throw new Error(`Клиентская ошибка`)
        }

        const editedUser = await response.json();

        users = users.map((user) => {
            if (user.id === editedUser.id) {
                return editedUser;
            }
            return user;
        })

        editUserFormDialog.close();
        renderUsers();

        alert("Пользователь отредактирован успешно!")

    } catch (error) {
        console.error("Error при редактировании пользователя! :", error.massage);
    }
}

// -------- Удаление существующего пользователя ------
const removeExistingUsersAsync = async (userId) => {
    try {
        const response = await fetch(`${MOCK_API_URL}/${userId}`, {
            method: "DELETE"
        });

        if (response.status === 404) {
            throw new Error(`${userId} не найден`)
        }

        const removeUser = await response.json();

        users = users.filter(user => user.id !== removeUser.id);
        renderUsers();

        alert("Пользователь успешно удалён!");

    } catch (error) {
        console.error("Error при удаление  пользователя!:", error.massage);
    }
}

// -------- Создание нового пользователя -------
const createNewUsersAsync = async (newUserData) => {
    try {
        const response = await fetch(MOCK_API_URL, {
            method: "POST",
            body: JSON.stringify(newUserData),
            headers: {
                "Content-type": "application/json"
            }
        });
        const newCreatedUser = await response.json();

        users.unshift(newCreatedUser);
        renderUsers();

        createUserForm.reset();
        alert("Новый пользователь создан успешно!")

    } catch (error) {
        console.error("Error при создании нового пользователя! :", error.massage);
    }
}


// -------- Получение всех пользователей --------
const getUsersAsync = async () => {
    try {
        const response = await fetch(MOCK_API_URL);
        users = await response.json();

        renderUsers();

    } catch (error) {
        console.error("Error при создании пользователя! :", error.massage);
    }
}

// ----- Отрисовка пользователей -----
const renderUsers = () => {
    usersContainer.innerHTML = "";

    users.forEach((user) => {
        usersContainer.insertAdjacentHTML("beforeend", `
            <div class="user-card">
            <h3>${user.name}</h3>
            <p>City: ${user.city}</p>
            <span>Email: ${user.email}</span>
            <img src="${user.avatar}"/>
            <button class="user-edit-btn" data-user-id="${user.id}" data-user-edit-btn>🛠️</button>
            <button class="user-remove-btn" data-user-id="${user.id}" data-user-remove-btn>❌</button>
            </div>
            `)
    })
}
// ------- Заполнение модального окна разметкой формы -----
const populateDialog = (userId) => {
    editUserFormDialog.innerHTML = "";

    const editForm = document.createElement("form");
    const closeFormBtn = document.createElement("button");

    closeFormBtn.classList.add("close-edit-form-btn");
    closeFormBtn.textContent = "❌";
    closeFormBtn.addEventListener("click", () => editUserFormDialog.close());

    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const formUserData = Object.fromEntries(formData);

        const newUserData = {
            id: formUserData.userId,
            name: formUserData.userName,
            city: formUserData.userCity,
            email: formUserData.userEmail,
            avatar: formUserData.imagesUrlId,
        }

        editExistingUsersAsync(newUserData);
    })

    editForm.classList.add('form');
    editForm.innerHTML = `
    <input type="text" name="userId" value="${userId}" hidden>
     <div class="control-field">
                        <label for="nameId" class="form-label">Name</label>
                        <input type="text" class="form-control" id="nameId" name="userName" required minlength="2" maxlength="23">
                    </div>

                    <div class="control-field">
                        <label for="cityId" class="form-label">City</label>
                        <input type="text" class="form-control" id="cityId" name="userCity" required minlength="2" maxlength="23">
                    </div>

                    <div class="control-field">
                        <label for="emailId" class="form-label">Email</label>
                        <input type="text" class="form-control" id="emailId" name="userEmail" required>
                    </div>

                    <div class="control-field">
                        <label for="imagesUrlId" class="form-label">Images</label>
                        
                        <select class="form-control form-control--images" name="imagesUrlId" id="imagesUrlId" required>
                            <option value="">Image URL</option>
                            <hr>
                            <option value="https://avatars.mds.yandex.net/i?id=db2ee0dcd83eb956a938fe08d86c59daa24ce6c0-12382841-images-thumbs&n=13">Cat 1</option>
                            <option value="https://avatars.mds.yandex.net/i?id=11d5cca55ae3e2be1c7d596b78800d26bbbfc36d-12422218-images-thumbs&n=13">Cat 2</option>
                            <option value="https://avatars.mds.yandex.net/i?id=0e42a7a08aa0f30b1bb0da91fe76aad115368b1f-10448622-images-thumbs&n=13">Cat 3</option>
                            <option value="https://avatars.mds.yandex.net/i?id=3e622a65f3fd95a55ea2f3993d5cb8a94e8bf5f9-13013698-images-thumbs&n=13">Dog 1</option>
                            <option value="https://avatars.mds.yandex.net/i?id=8f1556da72ee9bea9c709dec05904715615ed10c-4522636-images-thumbs&n=13">Dog 2</option>
                            <option value="https://avatars.mds.yandex.net/i?id=f8ec568a23a0a5aa1d0e104b0ded072647ad5888-10555250-images-thumbs&n=13">Dog 3</option>
                            <option value="https://avatars.mds.yandex.net/i?id=bdea002c245bcbd1b6ee72d9253a8c615e17c8f7-9098836-images-thumbs&n=13">Wolf 1</option>
                            <option value="https://avatars.mds.yandex.net/i?id=2a9338b3e572988ae349db96200d834abdc17a9c-12521528-images-thumbs&n=13">Fox 1</option>
                        </select>
                    </div>

                    <button type="submit" class="btn submit-btn">Edit User</button>
    `

    editUserFormDialog.append(editForm, closeFormBtn);
}

getUsersAsync();