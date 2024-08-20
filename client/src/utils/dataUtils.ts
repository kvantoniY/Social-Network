// utils/dateUtils.ts

export const formatDate = (isoDateString: string): string => {
    const dateObject = new Date(isoDateString);
  
    // Получаем день и месяц
    const day = dateObject.getDate();
    const monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const monthName = monthNames[dateObject.getMonth()]; // Индексация начинается с 0, поэтому getMonth() возвращает 0 для января
  
    // Получаем время
    const hours = dateObject.getHours().toString().padStart(2, '0'); // Добавляем ведущий ноль, если необходимо
    const minutes = dateObject.getMinutes().toString().padStart(2, '0'); // Добавляем ведущий ноль, если необходимо
  
    // Формируем итоговую строку
    return `${day} ${monthName}, ${hours}:${minutes}`;
  };
  