/**
 * Сервис для работы с бронированиями
 */

const { Booking, Room, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Создание нового бронирования
 * @param {Object} bookingData Данные бронирования
 * @param {number} userId ID пользователя, создающего бронирование
 * @returns {Promise<Object>} Созданное бронирование
 */
exports.createBooking = async (bookingData, userId) => {
  try {
    // Проверяем существование номера
    const room = await Room.findByPk(bookingData.roomId);
    if (!room) {
      throw new Error('Номер не найден');
    }

    // Проверяем доступность номера на указанные даты
    const isAvailable = await this.checkRoomAvailability(
      bookingData.roomId,
      bookingData.checkIn,
      bookingData.checkOut
    );

    if (!isAvailable) {
      throw new Error('Номер не доступен на указанные даты');
    }

    // Рассчитываем общую стоимость
    const totalPrice = this.calculateTotalPrice(
      room.price,
      new Date(bookingData.checkIn),
      new Date(bookingData.checkOut)
    );

    // Создаем бронирование
    const booking = await Booking.create({
      ...bookingData,
      UserId: userId,
      totalPrice,
      status: 'pending',
    });

    return booking;
  } catch (error) {
    logger.error('Ошибка при создании бронирования:', error);
    throw error;
  }
};

/**
 * Проверка доступности номера на указанные даты
 * @param {number} roomId ID номера
 * @param {Date} checkIn Дата заезда
 * @param {Date} checkOut Дата выезда
 * @returns {Promise<boolean>} Доступность номера
 */
exports.checkRoomAvailability = async (roomId, checkIn, checkOut) => {
  try {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Проверяем корректность дат
    if (checkInDate >= checkOutDate) {
      throw new Error('Дата выезда должна быть позже даты заезда');
    }

    // Ищем пересекающиеся бронирования
    const conflictingBookings = await Booking.findOne({
      where: {
        RoomId: roomId,
        status: {
          [Op.in]: ['pending', 'confirmed'],
        },
        [Op.or]: [
          {
            // Бронирование начинается в запрашиваемом периоде
            checkIn: {
              [Op.between]: [checkInDate, checkOutDate],
            },
          },
          {
            // Бронирование заканчивается в запрашиваемом периоде
            checkOut: {
              [Op.between]: [checkInDate, checkOutDate],
            },
          },
          {
            // Бронирование включает запрашиваемый период
            [Op.and]: [
              { checkIn: { [Op.lte]: checkInDate } },
              { checkOut: { [Op.gte]: checkOutDate } },
            ],
          },
        ],
      },
    });

    return !conflictingBookings;
  } catch (error) {
    logger.error('Ошибка при проверке доступности номера:', error);
    throw error;
  }
};

/**
 * Расчет общей стоимости бронирования
 * @param {number} pricePerNight Цена за ночь
 * @param {Date} checkIn Дата заезда
 * @param {Date} checkOut Дата выезда
 * @returns {number} Общая стоимость
 */
exports.calculateTotalPrice = (pricePerNight, checkIn, checkOut) => {
  const daysCount = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return pricePerNight * daysCount;
};

/**
 * Получение всех бронирований пользователя
 * @param {number} userId ID пользователя
 * @returns {Promise<Array>} Массив бронирований
 */
exports.getUserBookings = async (userId) => {
  try {
    return await Booking.findAll({
      where: { UserId: userId },
      include: [{ model: Room }],
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    logger.error(`Ошибка при получении бронирований пользователя ${userId}:`, error);
    throw error;
  }
};

/**
 * Получение бронирования по ID
 * @param {number} id ID бронирования
 * @param {number} userId ID пользователя (для проверки прав доступа)
 * @param {string} userRole Роль пользователя
 * @returns {Promise<Object>} Данные бронирования
 */
exports.getBookingById = async (id, userId, userRole) => {
  try {
    const booking = await Booking.findByPk(id, {
      include: [{ model: Room }, { model: User, attributes: ['firstName', 'lastName', 'email'] }],
    });

    if (!booking) {
      throw new Error('Бронирование не найдено');
    }

    // Проверяем права доступа (только владелец или администратор/менеджер)
    if (booking.UserId !== userId && userRole !== 'admin' && userRole !== 'manager') {
      throw new Error('Доступ запрещен');
    }

    return booking;
  } catch (error) {
    logger.error(`Ошибка при получении бронирования ${id}:`, error);
    throw error;
  }
};

/**
 * Отмена бронирования
 * @param {number} id ID бронирования
 * @param {number} userId ID пользователя
 * @param {string} userRole Роль пользователя
 * @returns {Promise<Object>} Обновленное бронирование
 */
exports.cancelBooking = async (id, userId, userRole) => {
  try {
    const booking = await Booking.findByPk(id);

    if (!booking) {
      throw new Error('Бронирование не найдено');
    }

    // Проверяем права доступа (только владелец или администратор/менеджер)
    if (booking.UserId !== userId && userRole !== 'admin' && userRole !== 'manager') {
      throw new Error('Доступ запрещен');
    }

    // Проверяем, что бронирование еще не началось
    if (new Date() > new Date(booking.checkIn)) {
      throw new Error('Нельзя отменить бронирование после даты заезда');
    }

    await booking.update({ status: 'canceled' });
    return booking;
  } catch (error) {
    logger.error(`Ошибка при отмене бронирования ${id}:`, error);
    throw error;
  }
};

/**
 * Получение всех бронирований (для администратора)
 * @returns {Promise<Array>} Массив всех бронирований
 */
exports.getAllBookings = async () => {
  try {
    return await Booking.findAll({
      include: [{ model: Room }, { model: User, attributes: ['firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    logger.error('Ошибка при получении всех бронирований:', error);
    throw error;
  }
};

/**
 * Обновление статуса бронирования (для администратора)
 * @param {number} id ID бронирования
 * @param {string} status Новый статус
 * @returns {Promise<Object>} Обновленное бронирование
 */
exports.updateBookingStatus = async (id, status) => {
  try {
    const booking = await Booking.findByPk(id);

    if (!booking) {
      throw new Error('Бронирование не найдено');
    }

    const allowedStatuses = ['pending', 'confirmed', 'canceled', 'completed'];
    if (!allowedStatuses.includes(status)) {
      throw new Error('Недопустимый статус');
    }

    await booking.update({ status });
    return booking;
  } catch (error) {
    logger.error(`Ошибка при обновлении статуса бронирования ${id}:`, error);
    throw error;
  }
};
