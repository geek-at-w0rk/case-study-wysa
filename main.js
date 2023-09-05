const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = '<mongo_uri>'; // Replace with your MongoDB connection uri
const databaseName = '<your_database_name>'; // Replace with your database name
const targetDate = '05/09/23'; // Replace with the target date you want to filter by

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // Query the User collection to get a list of users
    const users = await getUsers();

    // Initialize an empty array to store transformed data
    const transformedData = [];

    // Loop through users and extract data for each user on the target date
    for (const user of users) {
      const userTransformedData = await transformUserData(user, targetDate);
      transformedData.push(userTransformedData);
    }

    // Save the transformed data to a file or perform further processing
    fs.writeFileSync('transformed_data.json', JSON.stringify(transformedData));

  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    // Close the MongoDB connection when all data extraction is done
    await client.close();
    console.log('MongoDB connection closed');
  }
}

async function getUsers() {
  try {
    const database = client.db(databaseName);
    const userCollection = database.collection('User');
    // Query the User collection to get name and date created
    const users = await userCollection.find({}, { projection: { name: 1, createdAt: 1 } }).toArray();
    return users;
  } catch (err) {
    console.error('Error extracting user data:', err);
    return [];
  }
}

async function transformUserData(user, targetDate) {
  try {
    const database = client.db(databaseName);

    // Query Mood collection for mood_score for the specific user on the target date
    const moodData = await database.collection('Mood').findOne({ user: user.name, date: targetDate });

    // Query Activity collection for specified fields for the user on the target date
    const activityData = await database.collection('Activity').findOne({ user: user.name, date: targetDate });

    // Query Sleep collection for specified fields for the user on the target date
    const sleepData = await database.collection('Sleep').findOne({ user: user.name, date: targetDate });

    // Perform data transformation here
    const transformedUserData = {
      user: user._id,
      date: new Date(targetDate),
      mood_score: moodData ? moodData.mood_score : null,
      activity: activityData ? transformActivityData(activityData) : null,
      sleep: sleepData ? transformSleepData(sleepData) : null,
    };

    return transformedUserData;
  } catch (err) {
    console.error(`Error transforming data for User ${user.name} on ${targetDate}:`, err);
    return null;
  }
}

function transformActivityData(activityData) {
  // transformation of activity data
  return {
    start_time: activityData.StartTime,
    duration: activityData.Duration,
    activity_name: activityData.Activity,
    log_type: activityData.LogType,
    total_steps: activityData.Steps,
    total_distance: activityData.Distance,
    total_calories: activityData.Calories,
  };
}

function transformSleepData(sleepData) {
  // Perform transformation of sleep data
  return {
    start_time: sleepData['DURATION IN BED'].split(' - ')[0],
    sleep_score: sleepData['SLEEP SCORE'],
    hours_of_sleep: sleepData['HOURS OF SLEEP'],
    hours_in_bed: sleepData['HOURS IN BED'],
  };
}

connectToMongo();
