class User < ApplicationRecord
  has_many :friendships
  has_many :friends, through: :friendships, dependent: :destroy
  has_many :inverse_friendships, class_name: "Friendship", foreign_key: "friend_id"
  has_many :inverse_friends, through: :inverse_friendships, source: :user
  # after_create :create_short_url
  after_create :get_topics

  def all_friendships
    (self.friends + self.inverse_friends).uniq
  end

  def connection(user) #kevin bacon
    if user.all_friendships.include?(self)
      " is already your friend, ask them about"
    else
      friends = self.all_friendships & user.all_friendships
      if friends.present?
        "ask #{friends.map(&:name).join(', or ')} about "
      else
        "There is no one with 2 degrees of Kevin Bacon separation regarding... "
      end
    end
  end

  private

  def create_short_url
    Users::Shorten.get_short_url(user: self)
  end

  def get_topics
    Users::Info.get_topics(user: self)
  end

end
