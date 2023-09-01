import { AccountChnageCourse } from '@code/contracts';
import { IDomainEvent, IUser, IUserCourses, PurchaseState, UserRole } from '@code/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
	_id?: string;
	displayName?: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	courses?: IUserCourses[];
	events: IDomainEvent[] = [];

	constructor(user: IUser) {
		this._id = user._id;
		this.displayName = user.displayName;
		this.email = user.email;
		this.role = user.role;
		this.passwordHash = user.passwordHash;
		this.courses = user.courses;
	}

	public setCourseState(courseId: string, state: PurchaseState) {
		const existCourse = this.courses.find(({ _id }) => _id === courseId);
		if (!existCourse) {
			this.courses.push({
				courseId,
				purchaseState: state,
			});
			return this;
		}

		if (state === PurchaseState.Canceled) {
			this.courses = this.courses.filter(({ _id }) => _id !== courseId);
			return this;
		}
		
		this.courses = this.courses.map(course => ({
			...course,
			purchaseState: course.courseId === courseId ? state : course.purchaseState,
		}));

		this.events.push({
			topic: AccountChnageCourse.topic,
			data: {
				courseId,
				userId: this._id,
				state,
			},
		});

		return this;
	}

	public getPublicProfile() {
		const result = {
			email: this.email,
			role: this.role,
			displayName: this.displayName,
		};
		return result;
	}

	public async setPassword(password: string): Promise<this> {
		const salt = await genSalt(10);
		const passwordHash = await hash(password, salt);
		this.passwordHash = passwordHash;
		return this;
	}

	public validatePassword(password: string): Promise<boolean> {
		const result = compare(password, this.passwordHash);
		return result
	}

	public async changeProfile(displayName: string) {
		this.displayName = displayName;
	}
}
