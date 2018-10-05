class FriendshipsController < ApplicationController

  def create
    @user = User.find(params[:user_id])
    if @user.friendships.exists?(friend_id: params[:friend_id])
      format.html { redirect_to user_path(@user), notice: 'They are already friends.' }
    else
      @user.friendships.build(friend_id: params[:friend_id])


    respond_to do |format|
      if @user.save
        format.html { redirect_to user_path(@user), notice: 'Friendship was successfully added.' }
      else
        format.html { render :new }
        format.json { redirect_to root_url, alert: 'Friendship was not added.' }
      end
    end
    end
  end

  def destroy
    @user = User.find(params[:user_id])
    friend = @user.friendships.where(friend_id: params[:friend_id])
    if friend
      @user.friendships.delete(friend)
    end

    respond_to do |format|
      format.html { redirect_to user_path(@user), notice: 'Friendship was deleted.' }
    end
  end

end
